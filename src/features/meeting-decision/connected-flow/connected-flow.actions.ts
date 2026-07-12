import { candidateSlots } from '@/features/meeting-decision/data/candidate-slots'
import { decisionParticipants } from '@/features/meeting-decision/data/participants'
import { getScenarioPreset } from '@/features/meeting-decision/data/scenario-presets'
import { recommendMeeting } from '@/features/meeting-decision/engine/decision-engine'
import type {
  AttendanceType,
  MeetingRecommendation,
  ResponseOverrides,
  ScenarioPresetId,
  TimeSlotId,
} from '@/features/meeting-decision/engine/decision-engine.types'
import type { MeetingDraft } from '@/types/schedule'
import type {
  ConnectedFlowPhase,
  MeetingDecisionSession,
  MeetingRecord,
  SchedulingRequest,
} from './connected-flow.types'

const ORGANIZER_ID = 'minji'
const DEFAULT_MEETING: MeetingDraft = {
  title: '',
  location: '',
}

const FINALIZE_PHASES: ConnectedFlowPhase[] = [
  'organizer-result',
  'organizer-updated-result',
  'meeting-details',
]

/**
 * Single gate for entering meeting-details / creating a meeting.
 * Domain recommendation must be READY (READY_AFTER_CONFIRMATION is UI-only).
 * NEED_CONFIRMATION / WAITING / NO_OPTION and non-result phases are blocked.
 */
export function canFinalizeRecommendation(
  session: MeetingDecisionSession,
): boolean {
  if (session.createdMeeting || session.meetingCreatedAt) return false
  if (session.phase === 'completed' || session.phase === 'review-complete') {
    return false
  }
  if (!FINALIZE_PHASES.includes(session.phase)) return false

  const rec = session.currentRecommendation
  if (!rec || rec.status !== 'READY') return false
  return true
}

export function findCreatedMeeting(
  session: MeetingDecisionSession,
  slotId?: TimeSlotId,
): MeetingRecord | undefined {
  const created = session.createdMeeting
  if (!created) return undefined
  if (created.sessionId !== session.id) return undefined
  if (slotId && created.slotId !== slotId) return undefined
  return created
}

export function countAttendanceByType(
  attendanceTypes: Record<string, AttendanceType>,
): { requiredCount: number; optionalCount: number } {
  let requiredCount = 0
  let optionalCount = 0
  for (const type of Object.values(attendanceTypes)) {
    if (type === 'required') requiredCount += 1
    else optionalCount += 1
  }
  return { requiredCount, optionalCount }
}

export function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

export function runRecommendation(
  attendanceTypes: Record<string, AttendanceType>,
  responseOverrides: ResponseOverrides,
): MeetingRecommendation {
  return recommendMeeting({
    participants: decisionParticipants,
    candidateSlots,
    attendanceTypes,
    responseOverrides,
  })
}

function stamp(session: MeetingDecisionSession): MeetingDecisionSession {
  return { ...session, updatedAt: new Date().toISOString() }
}

export function createSession(
  scenarioSeed: ScenarioPresetId = 'coordination',
): MeetingDecisionSession {
  const preset = getScenarioPreset(scenarioSeed)
  return createSessionFromAttendance(
    preset.attendanceTypes,
    scenarioSeed,
    preset.responseOverrides,
  )
}

/** Fresh session from explicit attendance inputs — no result hardcoding. */
export function createSessionFromAttendance(
  attendanceTypes: Record<string, AttendanceType>,
  scenarioSeed: ScenarioPresetId = 'coordination',
  responseOverrides: ResponseOverrides = {},
): MeetingDecisionSession {
  const now = new Date().toISOString()
  const hasRejectedSeed =
    scenarioSeed === 'rejected' && Object.keys(responseOverrides).length > 0
  return {
    id: createId('session'),
    meetingDraftId: createId('draft'),
    organizerId: ORGANIZER_ID,
    participantIds: decisionParticipants.map((p) => p.id),
    attendanceTypes: { ...attendanceTypes },
    currentRecommendation: null,
    responseOverrides: structuredClone(responseOverrides),
    isNextAlternative: hasRejectedSeed,
    isReadyAfterConfirmation: false,
    actor: 'organizer',
    phase: hasRejectedSeed ? 'analyzing' : 'participant-setup',
    meeting: { ...DEFAULT_MEETING },
    scenarioSeed,
    createdAt: now,
    updatedAt: now,
  }
}

export function withAttendanceType(
  session: MeetingDecisionSession,
  participantId: string,
  type: AttendanceType,
): MeetingDecisionSession {
  const person = decisionParticipants.find((p) => p.id === participantId)
  if (!person || person.isOrganizer) return session
  return stamp({
    ...session,
    attendanceTypes: { ...session.attendanceTypes, [participantId]: type },
  })
}

export function startAnalyzing(
  session: MeetingDecisionSession,
): MeetingDecisionSession {
  return stamp({
    ...session,
    responseOverrides: {},
    activeRequest: undefined,
    previousRecommendation: undefined,
    currentRecommendation: null,
    isNextAlternative: false,
    isReadyAfterConfirmation: false,
    phase: 'analyzing',
    actor: 'organizer',
  })
}

export function applyAnalyzedRecommendation(
  session: MeetingDecisionSession,
  recommendation: MeetingRecommendation,
  options: { isNextAlternative?: boolean; readyAfterConfirmation?: boolean } = {},
): MeetingDecisionSession {
  const isNext = Boolean(options.isNextAlternative)
  const readyAfter = Boolean(options.readyAfterConfirmation)
  let phase: ConnectedFlowPhase = 'organizer-result'
  if (readyAfter || isNext) {
    phase = 'organizer-updated-result'
  }
  return stamp({
    ...session,
    currentRecommendation: recommendation,
    isNextAlternative: isNext,
    isReadyAfterConfirmation: readyAfter,
    phase,
    actor: 'organizer',
  })
}

function firstRequiredConfirmationTarget(
  recommendation: MeetingRecommendation | null,
) {
  if (!recommendation || recommendation.status !== 'NEED_CONFIRMATION') {
    return null
  }
  const target = recommendation.confirmationTargets[0]
  if (!target) return null
  const person = decisionParticipants.find((p) => p.id === target.participantId)
  if (!person || person.isOrganizer) return null
  const attendance =
    recommendation.evaluation.participantImpacts.find(
      (i) => i.participantId === target.participantId,
    )?.attendanceType ?? 'required'
  if (attendance !== 'required') return null
  return target
}

export function openRequestPreview(
  session: MeetingDecisionSession,
): MeetingDecisionSession {
  const target = firstRequiredConfirmationTarget(session.currentRecommendation)
  if (!target || !session.currentRecommendation) {
    throw new Error('요청 대상을 만들 수 없어요.')
  }
  if (session.currentRecommendation.status !== 'NEED_CONFIRMATION') {
    throw new Error('조율이 필요한 추천에서만 요청할 수 있어요.')
  }

  const slot = session.currentRecommendation.evaluation.slot
  const draft: SchedulingRequest = {
    id: createId('req'),
    meetingDraftId: session.meetingDraftId,
    slotId: slot.id,
    dateLabel: slot.dateLabel,
    timeLabel: slot.timeLabel,
    organizerId: session.organizerId,
    organizerName:
      decisionParticipants.find((p) => p.id === session.organizerId)?.name ??
      '김민지',
    targetParticipantId: target.participantId,
    targetParticipantName: target.name,
    conflictPublicLabel: target.publicLabel,
    meetingTitle: session.meeting.title,
    status: 'draft',
    createdAt: new Date().toISOString(),
  }

  return stamp({
    ...session,
    activeRequest: draft,
    phase: 'request-preview',
    actor: 'organizer',
  })
}

export function beginSendingRequest(
  session: MeetingDecisionSession,
): MeetingDecisionSession {
  if (!session.activeRequest || session.activeRequest.status !== 'draft') {
    throw new Error('보낼 요청이 없어요.')
  }
  return stamp({
    ...session,
    activeRequest: { ...session.activeRequest, status: 'sent' },
    phase: 'sending-request',
    actor: 'organizer',
  })
}

export function markRequestPending(
  session: MeetingDecisionSession,
): MeetingDecisionSession {
  if (!session.activeRequest) {
    throw new Error('요청이 없어요.')
  }
  return stamp({
    ...session,
    activeRequest: { ...session.activeRequest, status: 'pending' },
    phase: 'organizer-waiting',
    actor: 'organizer',
  })
}

export function openAttendeeView(
  session: MeetingDecisionSession,
  requestId: string,
): MeetingDecisionSession {
  const request = session.activeRequest
  if (!request || request.id !== requestId) {
    throw new Error('요청을 찾을 수 없어요.')
  }
  if (request.status === 'approved') {
    return stamp({
      ...session,
      phase: 'attendee-approved',
      actor: 'attendee',
    })
  }
  if (request.status === 'declined') {
    return stamp({
      ...session,
      phase: 'attendee-declined',
      actor: 'attendee',
    })
  }
  if (request.status === 'resolved') {
    return stamp({
      ...session,
      phase:
        request.response === 'approved'
          ? 'attendee-approved'
          : 'attendee-declined',
      actor: 'attendee',
    })
  }
  if (request.status !== 'pending' && request.status !== 'sent') {
    throw new Error('아직 응답할 수 없는 요청이에요.')
  }
  return stamp({
    ...session,
    phase: 'attendee-request',
    actor: 'attendee',
  })
}

function withOverride(
  prev: ResponseOverrides,
  participantId: string,
  slotId: TimeSlotId,
  value: 'approved' | 'declined',
): ResponseOverrides {
  return {
    ...prev,
    [participantId]: {
      ...prev[participantId],
      [slotId]: value,
    },
  }
}

export function beginAttendeeResponse(
  session: MeetingDecisionSession,
  requestId: string,
): MeetingDecisionSession {
  const request = session.activeRequest
  if (!request || request.id !== requestId) {
    throw new Error('요청을 찾을 수 없어요.')
  }
  if (
    request.status === 'approved' ||
    request.status === 'declined' ||
    request.status === 'resolved'
  ) {
    throw new Error('이미 응답한 요청이에요.')
  }
  if (request.status !== 'pending') {
    throw new Error('아직 응답할 수 없는 요청이에요.')
  }
  return stamp({
    ...session,
    phase: 'attendee-submitting',
    actor: 'attendee',
  })
}

export function completeAttendeeResponse(
  session: MeetingDecisionSession,
  requestId: string,
  response: 'approved' | 'declined',
): MeetingDecisionSession {
  const request = session.activeRequest
  if (!request || request.id !== requestId) {
    throw new Error('요청을 찾을 수 없어요.')
  }
  if (
    request.status === 'approved' ||
    request.status === 'declined' ||
    request.status === 'resolved'
  ) {
    throw new Error('이미 응답한 요청이에요.')
  }

  const nextOverrides = withOverride(
    session.responseOverrides,
    request.targetParticipantId,
    request.slotId,
    response,
  )

  return stamp({
    ...session,
    responseOverrides: nextOverrides,
    activeRequest: {
      ...request,
      status: response,
      response,
      respondedAt: new Date().toISOString(),
    },
    phase: response === 'approved' ? 'attendee-approved' : 'attendee-declined',
    actor: 'attendee',
  })
}

export function resolveAfterAttendeeResponse(
  session: MeetingDecisionSession,
): MeetingDecisionSession {
  const request = session.activeRequest
  if (!request?.response) {
    throw new Error('응답이 없어요.')
  }

  const previous = session.currentRecommendation ?? undefined
  const next = runRecommendation(
    session.attendanceTypes,
    session.responseOverrides,
  )

  const readyAfter = request.response === 'approved' && next.status === 'READY'
  const isNext = request.response === 'declined'

  return stamp({
    ...session,
    previousRecommendation: previous,
    currentRecommendation: next,
    activeRequest: { ...request, status: 'resolved' },
    isNextAlternative: isNext,
    isReadyAfterConfirmation: readyAfter,
    phase: 'organizer-updated-result',
    actor: 'organizer',
  })
}

export function returnToOrganizer(
  session: MeetingDecisionSession,
): MeetingDecisionSession {
  if (session.activeRequest?.status === 'pending') {
    return stamp({
      ...session,
      phase: 'organizer-waiting',
      actor: 'organizer',
    })
  }
  if (session.phase === 'organizer-updated-result' || session.currentRecommendation) {
    return stamp({
      ...session,
      phase:
        session.isReadyAfterConfirmation || session.isNextAlternative
          ? 'organizer-updated-result'
          : 'organizer-result',
      actor: 'organizer',
    })
  }
  return stamp({ ...session, phase: 'participant-setup', actor: 'organizer' })
}

export function backFromPreview(
  session: MeetingDecisionSession,
): MeetingDecisionSession {
  return stamp({
    ...session,
    activeRequest: undefined,
    phase: session.isNextAlternative
      ? 'organizer-updated-result'
      : 'organizer-result',
    actor: 'organizer',
  })
}

export function goToMeetingDetails(
  session: MeetingDecisionSession,
): MeetingDecisionSession {
  const existing = session.createdMeeting
  if (existing || session.meetingCreatedAt || session.phase === 'completed') {
    return stamp({
      ...session,
      phase: 'completed',
      actor: 'organizer',
      meetingCreatedAt: existing?.createdAt ?? session.meetingCreatedAt,
    })
  }
  if (!canFinalizeRecommendation(session)) {
    return session
  }
  return stamp({ ...session, phase: 'meeting-details', actor: 'organizer' })
}

/**
 * Creates the meeting once. Domain duplicate defense:
 * same sessionId + slotId → return existing completion.
 */
export function completeMeeting(
  session: MeetingDecisionSession,
): MeetingDecisionSession {
  const rec = session.currentRecommendation
  const slotId =
    rec && rec.status !== 'NO_OPTION' ? rec.evaluation.slot.id : undefined
  const existing =
    findCreatedMeeting(session, slotId) ?? session.createdMeeting

  if (existing) {
    return stamp({
      ...session,
      phase: 'completed',
      actor: 'organizer',
      createdMeeting: existing,
      meetingCreatedAt: existing.createdAt,
      meeting: {
        title: existing.title,
        location: existing.location,
      },
    })
  }

  if (session.meetingCreatedAt || session.phase === 'completed') {
    return stamp({
      ...session,
      phase: 'completed',
      actor: 'organizer',
      meetingCreatedAt:
        session.meetingCreatedAt ?? new Date().toISOString(),
    })
  }

  if (session.phase !== 'meeting-details') {
    return session
  }
  if (!canFinalizeRecommendation(session)) {
    return session
  }
  if (!rec || rec.status !== 'READY') {
    return session
  }

  const title = session.meeting.title.trim()
  if (!title) {
    return session
  }

  const location = session.meeting.location.trim()
  const counts = countAttendanceByType(session.attendanceTypes)
  const slot = rec.evaluation.slot
  const createdAt = new Date().toISOString()
  const record: MeetingRecord = {
    id: createId('meeting'),
    sessionId: session.id,
    meetingDraftId: session.meetingDraftId,
    slotId: slot.id,
    dateLabel: slot.dateLabel,
    timeLabel: slot.timeLabel,
    title,
    location,
    requiredCount: counts.requiredCount,
    optionalCount: counts.optionalCount,
    createdAt,
  }

  return stamp({
    ...session,
    meeting: { title, location },
    createdMeeting: record,
    meetingCreatedAt: createdAt,
    phase: 'completed',
    actor: 'organizer',
  })
}

export function finishReview(
  session: MeetingDecisionSession,
): MeetingDecisionSession {
  return stamp({ ...session, phase: 'review-complete', actor: 'organizer' })
}

export function changeConditions(
  session: MeetingDecisionSession,
): MeetingDecisionSession {
  return stamp({
    ...session,
    currentRecommendation: null,
    previousRecommendation: undefined,
    activeRequest: undefined,
    responseOverrides: {},
    isNextAlternative: false,
    isReadyAfterConfirmation: false,
    meetingCreatedAt: undefined,
    createdMeeting: undefined,
    meeting: { ...DEFAULT_MEETING },
    phase: 'participant-setup',
    actor: 'organizer',
  })
}

export function updateMeetingDraft(
  session: MeetingDecisionSession,
  draft: Partial<MeetingDraft>,
): MeetingDecisionSession {
  return stamp({
    ...session,
    meeting: { ...session.meeting, ...draft },
  })
}

export function backToDecision(
  session: MeetingDecisionSession,
): MeetingDecisionSession {
  if (!session.currentRecommendation) {
    return stamp({ ...session, phase: 'participant-setup', actor: 'organizer' })
  }
  if (session.activeRequest?.status === 'pending') {
    return stamp({ ...session, phase: 'organizer-waiting', actor: 'organizer' })
  }
  return stamp({
    ...session,
    phase:
      session.isReadyAfterConfirmation || session.isNextAlternative
        ? 'organizer-updated-result'
        : 'organizer-result',
    actor: 'organizer',
  })
}
