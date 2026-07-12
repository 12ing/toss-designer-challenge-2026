import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { candidateSlots } from '@/features/meeting-decision/data/candidate-slots'
import { decisionParticipants } from '@/features/meeting-decision/data/participants'
import { recommendMeeting } from '@/features/meeting-decision/engine/decision-engine'
import type {
  AttendanceType,
  ScenarioPresetId,
} from '@/features/meeting-decision/engine/decision-engine.types'
import {
  applyAnalyzedRecommendation,
  backFromPreview,
  backToDecision,
  beginAttendeeResponse,
  beginSendingRequest,
  changeConditions,
  completeAttendeeResponse,
  completeMeeting,
  createSession,
  finishReview,
  goToMeetingDetails,
  markRequestPending,
  openAttendeeView,
  openRequestPreview,
  resolveAfterAttendeeResponse,
  returnToOrganizer,
  runRecommendation,
  startAnalyzing,
  updateMeetingDraft,
  withAttendanceType,
} from '@/features/meeting-decision/connected-flow/connected-flow.actions'
import {
  clearSession,
  loadSession,
  saveSession,
} from '@/features/meeting-decision/connected-flow/connected-flow.persistence'
import {
  toDecisionSurfaceMode,
  toLegacyDecisionState,
} from '@/features/meeting-decision/connected-flow/connected-flow.selectors'
import type { MeetingDecisionSession } from '@/features/meeting-decision/connected-flow/connected-flow.types'
import {
  recommendationToUi,
} from '@/features/meeting-decision/mappers/to-ui'
import type { MeetingDraft, Participant } from '@/types/schedule'

const ANALYZE_MS = 1000
const SEND_REQUEST_MS = 700
const ATTENDEE_RESPONSE_MS = 600

function toUiParticipants(
  attendanceTypes: Record<string, AttendanceType>,
): Participant[] {
  return decisionParticipants.map((person) => ({
    id: person.id,
    name: person.name,
    role: person.role,
    isOrganizer: person.isOrganizer,
    attendanceType: attendanceTypes[person.id] ?? person.defaultAttendanceType,
  }))
}

function commit(
  next: MeetingDecisionSession,
  setSession: (s: MeetingDecisionSession) => void,
) {
  saveSession(next)
  setSession(next)
}

export function usePrototypeFlow(initialScenario: ScenarioPresetId) {
  const [session, setSession] = useState<MeetingDecisionSession>(() => {
    // Prefer an explicitly created review/lab session so fresh runs are not wiped.
    const existing = loadSession()
    if (existing) return existing
    const created = createSession(initialScenario)
    saveSession(created)
    return created
  })
  const [playCardEnter, setPlayCardEnter] = useState(false)
  const [reasonExpanded, setReasonExpanded] = useState(false)
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [isResponding, setIsResponding] = useState(false)

  const bootstrappedScenario = useRef(session.scenarioSeed)
  const sessionRef = useRef(session)
  sessionRef.current = session

  const bootstrap = useCallback((id: ScenarioPresetId) => {
    clearSession()
    const created = createSession(id)
    saveSession(created)
    setSession(created)
    setPlayCardEnter(false)
    setReasonExpanded(false)
    setIsSendingRequest(false)
    setIsResponding(false)
    bootstrappedScenario.current = id
  }, [])

  useEffect(() => {
    if (bootstrappedScenario.current === initialScenario) return
    const existing = loadSession()
    if (existing) {
      // Keep factory-created sessions (custom attendance / ready / coordination).
      bootstrappedScenario.current = existing.scenarioSeed
      setSession(existing)
      return
    }
    bootstrap(initialScenario)
  }, [initialScenario, bootstrap])

  useEffect(() => {
    if (session.phase !== 'analyzing') return

    const timer = window.setTimeout(() => {
      const current = sessionRef.current
      const params = new URLSearchParams(window.location.search)
      let result = runRecommendation(
        current.attendanceTypes,
        current.responseOverrides,
      )

      if (params.get('fixture') === 'no-option') {
        const blocked = decisionParticipants.map((p) => {
          if (p.id !== 'minji') return p
          const schedule = { ...p.schedule }
          for (const slot of candidateSlots) {
            schedule[slot.id] = {
              type: 'hard-busy' as const,
              publicLabel: '일정 있음',
            }
          }
          return { ...p, schedule }
        })
        result = recommendMeeting({
          participants: blocked,
          candidateSlots,
          attendanceTypes: current.attendanceTypes,
          responseOverrides: {},
        })
      }

      const next = applyAnalyzedRecommendation(current, result, {
        isNextAlternative: current.isNextAlternative,
      })
      commit(next, setSession)
      setPlayCardEnter(true)
    }, ANALYZE_MS)

    return () => window.clearTimeout(timer)
  }, [session.phase, session.id])

  const participants = useMemo(
    () => toUiParticipants(session.attendanceTypes),
    [session.attendanceTypes],
  )

  const recommendation = session.currentRecommendation
  const uiView = useMemo(
    () => (recommendation ? recommendationToUi(recommendation) : null),
    [recommendation],
  )

  const surfaceMode = toDecisionSurfaceMode(session)
  const state = toLegacyDecisionState(session)
  const activeRequest = session.activeRequest

  const setAttendanceType = useCallback(
    (id: string, type: AttendanceType) => {
      commit(withAttendanceType(sessionRef.current, id, type), setSession)
    },
    [],
  )

  const startAnalyzingFlow = useCallback(() => {
    commit(startAnalyzing(sessionRef.current), setSession)
    setReasonExpanded(false)
  }, [])

  const openRequestPreviewFlow = useCallback(() => {
    commit(openRequestPreview(sessionRef.current), setSession)
  }, [])

  const sendRequest = useCallback(() => {
    setIsSendingRequest(true)
    const sending = beginSendingRequest(sessionRef.current)
    commit(sending, setSession)
    window.setTimeout(() => {
      const pending = markRequestPending(sending)
      commit(pending, setSession)
      setIsSendingRequest(false)
    }, SEND_REQUEST_MS)
  }, [])

  const openAttendeeRequest = useCallback((requestId?: string) => {
    const id = requestId ?? sessionRef.current.activeRequest?.id
    if (!id) return
    commit(openAttendeeView(sessionRef.current, id), setSession)
  }, [])

  const approveRequest = useCallback((requestId?: string) => {
    const id = requestId ?? sessionRef.current.activeRequest?.id
    if (!id) return
    setIsResponding(true)
    const submitting = beginAttendeeResponse(sessionRef.current, id)
    commit(submitting, setSession)
    window.setTimeout(() => {
      const done = completeAttendeeResponse(submitting, id, 'approved')
      commit(done, setSession)
      setIsResponding(false)
    }, ATTENDEE_RESPONSE_MS)
  }, [])

  const rejectRequest = useCallback((requestId?: string) => {
    const id = requestId ?? sessionRef.current.activeRequest?.id
    if (!id) return
    setIsResponding(true)
    const submitting = beginAttendeeResponse(sessionRef.current, id)
    commit(submitting, setSession)
    window.setTimeout(() => {
      const done = completeAttendeeResponse(submitting, id, 'declined')
      commit(done, setSession)
      setIsResponding(false)
    }, ATTENDEE_RESPONSE_MS)
  }, [])

  const finishAttendeeApproved = useCallback(() => {
    commit(resolveAfterAttendeeResponse(sessionRef.current), setSession)
  }, [])

  const finishAttendeeRejected = useCallback(() => {
    commit(resolveAfterAttendeeResponse(sessionRef.current), setSession)
  }, [])

  const returnToOrganizerFlow = useCallback(() => {
    commit(returnToOrganizer(sessionRef.current), setSession)
  }, [])

  const reloadFromStorage = useCallback(() => {
    const loaded = loadSession()
    if (loaded) setSession(loaded)
  }, [])

  return {
    session,
    state,
    scenarioId: session.scenarioSeed,
    participants,
    attendanceTypes: session.attendanceTypes,
    meeting: session.meeting,
    isSendingRequest,
    isResponding,
    reasonExpanded,
    playCardEnter,
    recommendation,
    uiView,
    confirmationTarget: uiView?.confirmation,
    isNextAlternative: session.isNextAlternative,
    surfaceMode,
    activeRequest,
    sessionId: session.id,
    acknowledgeCardEnter: () => setPlayCardEnter(false),
    selectScenario: bootstrap,
    setAttendanceType,
    startAnalyzing: startAnalyzingFlow,
    goToMeetingDetails: () =>
      commit(goToMeetingDetails(sessionRef.current), setSession),
    completeMeeting: () =>
      commit(completeMeeting(sessionRef.current), setSession),
    finishReview: () => commit(finishReview(sessionRef.current), setSession),
    backToDecision: () =>
      commit(backToDecision(sessionRef.current), setSession),
    openRequestPreview: openRequestPreviewFlow,
    sendRequest,
    openAttendeeRequest,
    approveRequest,
    rejectRequest,
    finishAttendeeApproved,
    finishAttendeeRejected,
    returnToOrganizer: returnToOrganizerFlow,
    backFromPreview: () =>
      commit(backFromPreview(sessionRef.current), setSession),
    toggleReasonExpanded: () => setReasonExpanded((prev) => !prev),
    updateMeeting: (draft: Partial<MeetingDraft>) =>
      commit(updateMeetingDraft(sessionRef.current, draft), setSession),
    changeConditions: () =>
      commit(changeConditions(sessionRef.current), setSession),
    reloadFromStorage,
  }
}
