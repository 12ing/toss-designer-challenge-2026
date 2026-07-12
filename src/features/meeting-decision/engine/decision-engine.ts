import type {
  AttendanceType,
  ConfirmationTarget,
  DecisionParticipant,
  MeetingRecommendation,
  ParticipantImpact,
  ReasonRow,
  ResponseOverrides,
  SlotEvaluation,
  SlotState,
  TimeSlot,
  TimeSlotId,
} from './decision-engine.types'

const NO_OPTION_SUMMARY =
  '현재 조건으로는 다음 주 안에 필수 참석자가 모두 가능한 1시간을 찾을 수 없어요.'

export function getEffectiveSlotState(
  participant: DecisionParticipant,
  slotId: TimeSlotId,
  overrides: ResponseOverrides,
): SlotState {
  const base = participant.schedule[slotId] ?? { type: 'free' as const }
  const override = overrides[participant.id]?.[slotId]

  if (!override) return base
  if (base.type !== 'protected') return base

  if (override === 'approved') return { type: 'free' }
  return { type: 'hard-busy', publicLabel: base.publicLabel }
}

function softNoteLabel(state: Extract<SlotState, { type: 'soft-penalty' }>) {
  if (state.kind === 'travel') return `${state.publicLabel} 가능`
  if (state.kind === 'preference') return '선호 반영'
  return state.publicLabel
}

function pushImpact(
  list: ParticipantImpact[],
  impact: ParticipantImpact,
) {
  list.push(impact)
}

export function evaluateSlot(params: {
  slot: TimeSlot
  participants: DecisionParticipant[]
  attendanceTypes: Record<string, AttendanceType>
  responseOverrides: ResponseOverrides
}): SlotEvaluation {
  const { slot, participants, attendanceTypes, responseOverrides } = params

  let requiredHardConflictCount = 0
  let requiredSoftPenalty = 0
  let optionalAvailableCount = 0
  let optionalSoftPenalty = 0
  let requiredTotalCount = 0
  let optionalTotalCount = 0
  let requiredAvailableCount = 0

  const requiredConfirmationTargets: ConfirmationTarget[] = []
  const participantImpacts: ParticipantImpact[] = []
  let hasTravelNote = false
  let hasPreferenceNote = false

  for (const person of participants) {
    const attendanceType =
      attendanceTypes[person.id] ?? person.defaultAttendanceType
    const state = getEffectiveSlotState(person, slot.id, responseOverrides)

    if (attendanceType === 'required') {
      requiredTotalCount += 1

      if (state.type === 'hard-busy') {
        requiredHardConflictCount += 1
        pushImpact(participantImpacts, {
          participantId: person.id,
          name: person.name,
          attendanceType,
          status: 'required-available-with-note',
          label: `${person.name} · 필수 · 일정 충돌 · ${state.publicLabel}`,
          publicContext: state.publicLabel,
        })
        continue
      }

      if (state.type === 'protected') {
        requiredConfirmationTargets.push({
          participantId: person.id,
          name: person.name,
          publicLabel: state.publicLabel,
        })
        pushImpact(participantImpacts, {
          participantId: person.id,
          name: person.name,
          attendanceType,
          status: 'required-confirmation',
          label: `${person.name} · 필수 · 확인 필요 · ${state.publicLabel}`,
          publicContext: state.publicLabel,
        })
        continue
      }

      requiredAvailableCount += 1

      if (state.type === 'soft-penalty') {
        requiredSoftPenalty += state.penalty
        if (state.kind === 'travel') hasTravelNote = true
        if (state.kind === 'preference') hasPreferenceNote = true
        const note = softNoteLabel(state)
        pushImpact(participantImpacts, {
          participantId: person.id,
          name: person.name,
          attendanceType,
          status: 'required-available-with-note',
          label: `${person.name} · 필수 · ${note}`,
          publicContext: state.publicLabel,
        })
        continue
      }

      pushImpact(participantImpacts, {
        participantId: person.id,
        name: person.name,
        attendanceType,
        status: 'required-available',
        label: `${person.name} · 필수 · 가능`,
      })
      continue
    }

    optionalTotalCount += 1

    if (state.type === 'free') {
      optionalAvailableCount += 1
      pushImpact(participantImpacts, {
        participantId: person.id,
        name: person.name,
        attendanceType,
        status: 'optional-available',
        label: `${person.name} · 선택 · 가능`,
      })
      continue
    }

    if (state.type === 'soft-penalty') {
      optionalAvailableCount += 1
      optionalSoftPenalty += state.penalty
      const note = softNoteLabel(state)
      pushImpact(participantImpacts, {
        participantId: person.id,
        name: person.name,
        attendanceType,
        status: 'optional-available-with-note',
        label: `${person.name} · 선택 · ${note}`,
        publicContext: state.publicLabel,
      })
      continue
    }

    // hard-busy | protected → unavailable, never a confirmation target
    pushImpact(participantImpacts, {
      participantId: person.id,
      name: person.name,
      attendanceType,
      status: 'optional-unavailable',
      label: `${person.name} · 선택 · 참석 어려움`,
      publicContext:
        state.type === 'protected' || state.type === 'hard-busy'
          ? state.publicLabel
          : undefined,
    })
  }

  return {
    slot,
    requiredHardConflictCount,
    requiredConfirmationTargets,
    requiredSoftPenalty,
    optionalAvailableCount,
    optionalTotalCount,
    optionalSoftPenalty,
    requiredTotalCount,
    requiredAvailableCount,
    participantImpacts,
    reasonRows: buildReasonRows({
      requiredTotalCount,
      requiredAvailableCount,
      requiredConfirmationTargets,
      optionalTotalCount,
      optionalAvailableCount,
      hasTravelNote,
      hasPreferenceNote,
    }),
  }
}

function buildReasonRows(input: {
  requiredTotalCount: number
  requiredAvailableCount: number
  requiredConfirmationTargets: ConfirmationTarget[]
  optionalTotalCount: number
  optionalAvailableCount: number
  hasTravelNote: boolean
  hasPreferenceNote: boolean
}): ReasonRow[] {
  const confirmCount = input.requiredConfirmationTargets.length
  const requiredValue =
    confirmCount === 0 &&
    input.requiredAvailableCount === input.requiredTotalCount
      ? `${input.requiredTotalCount}명 모두 가능`
      : confirmCount > 0
        ? `${input.requiredAvailableCount}명 가능 · 확인 ${confirmCount}건`
        : `${input.requiredAvailableCount}명 가능`

  const optionalValue =
    input.optionalTotalCount === 0
      ? '선택 없음'
      : input.optionalAvailableCount === input.optionalTotalCount
        ? `${input.optionalTotalCount}명 모두 가능`
        : `${input.optionalTotalCount}명 중 ${input.optionalAvailableCount}명 가능`

  return [
    { key: 'required', label: '필수 참석자', value: requiredValue },
    {
      key: 'travel',
      label: '이동 일정',
      value: input.hasTravelNote
        ? '외근 이후 이동을 반영함'
        : '외근 전후와 겹치지 않음',
    },
    {
      key: 'preference',
      label: '개인 선호',
      value:
        confirmCount > 0
          ? '보호 시간 확인 필요'
          : input.hasPreferenceNote
            ? '선호를 반영함'
            : '충돌 없음',
    },
    { key: 'optional', label: '선택 참석자', value: optionalValue },
  ]
}

/** lexicographic comparator — lower rank is better */
export function compareSlotEvaluations(a: SlotEvaluation, b: SlotEvaluation) {
  const aConfirm = a.requiredConfirmationTargets.length
  const bConfirm = b.requiredConfirmationTargets.length
  if (aConfirm !== bConfirm) return aConfirm - bConfirm

  if (a.requiredSoftPenalty !== b.requiredSoftPenalty) {
    return a.requiredSoftPenalty - b.requiredSoftPenalty
  }

  if (a.optionalAvailableCount !== b.optionalAvailableCount) {
    return b.optionalAvailableCount - a.optionalAvailableCount
  }

  if (a.optionalSoftPenalty !== b.optionalSoftPenalty) {
    return a.optionalSoftPenalty - b.optionalSoftPenalty
  }

  return Date.parse(a.slot.startAt) - Date.parse(b.slot.startAt)
}

export function recommendMeeting(params: {
  participants: DecisionParticipant[]
  candidateSlots: TimeSlot[]
  attendanceTypes: Record<string, AttendanceType>
  responseOverrides: ResponseOverrides
}): MeetingRecommendation {
  const evaluations = params.candidateSlots.map((slot) =>
    evaluateSlot({
      slot,
      participants: params.participants,
      attendanceTypes: params.attendanceTypes,
      responseOverrides: params.responseOverrides,
    }),
  )

  const valid = evaluations.filter((e) => e.requiredHardConflictCount === 0)

  if (valid.length === 0) {
    return {
      status: 'NO_OPTION',
      evaluations,
      blockingSummary: NO_OPTION_SUMMARY,
    }
  }

  const ranked = [...valid].sort(compareSlotEvaluations)
  const winner = ranked[0]

  if (winner.requiredConfirmationTargets.length === 0) {
    return { status: 'READY', evaluation: winner }
  }

  return {
    status: 'NEED_CONFIRMATION',
    evaluation: winner,
    confirmationTargets: [...winner.requiredConfirmationTargets],
  }
}

export function scoreVector(evaluation: SlotEvaluation) {
  return [
    evaluation.requiredConfirmationTargets.length,
    evaluation.requiredSoftPenalty,
    -evaluation.optionalAvailableCount,
    evaluation.optionalSoftPenalty,
    Date.parse(evaluation.slot.startAt),
  ] as const
}
