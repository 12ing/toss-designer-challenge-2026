import type {
  MeetingRecommendation,
  ParticipantImpact,
  SlotEvaluation,
} from '@/features/meeting-decision/engine/decision-engine.types'

export type DecisionSurfaceMode =
  | 'ready'
  | 'need-confirmation'
  | 'waiting'
  | 'ready-after-confirmation'
  | 'next-alternative'
  | 'no-option'

export type ImpactTone = 'positive' | 'neutral' | 'attention'

export type ParticipantImpactViewModel = {
  participantId: string
  name: string
  roleLabel: '필수' | '선택'
  statusLabel: string
  contextLabel?: string
  tone: ImpactTone
}

export type DecisionSurfaceViewModel = {
  mode: DecisionSurfaceMode
  contextLabel: string
  dateLabel?: string
  timeLabel?: string
  stateLabel: string
  summaryLines: string[]
  confirmationLine?: string
  supportingLabel?: string
  participantRows: ParticipantImpactViewModel[]
  confirmationCount: number
  reasonRows: Array<{ label: string; value: string }>
  reasonClosedLabel: string
  reasonNote: string
  primaryAction?: {
    label: string
    kind: 'confirm' | 'request' | 'edit-conditions'
  }
  peoplePanelTitle: string
  blockingRows?: Array<{ label: string; value: string }>
  mobilePeopleSummary: string
}

const CONTEXT = '다음 주 · 1시간 · 6명'
const REASON_NOTE =
  '필수 참석 가능 여부를 먼저 확인한 뒤, 추가 조율이 적은 순서로 비교했어요.'

const ALLOWED_CONTEXT = new Set([
  '개인 보호 시간',
  '점심 직후 회피',
  '외근',
  '외근 이후 이동',
  '고객 대응',
  '연속 회의',
  '일정 있음',
])

function sanitizeContext(raw?: string): string | undefined {
  if (!raw) return undefined
  if (ALLOWED_CONTEXT.has(raw)) return raw
  if (raw.includes('보호')) return '개인 보호 시간'
  if (raw.includes('점심')) return '점심 직후 회피'
  if (raw.includes('외근 이후') || raw.includes('이동')) return '외근 이후 이동'
  if (raw.includes('외근')) return '외근'
  if (raw.includes('고객')) return '고객 대응'
  if (raw.includes('연속')) return '연속 회의'
  return '일정 있음'
}

function mapImpactStatus(
  impact: ParticipantImpact,
  options: { waitingParticipantId?: string },
): Pick<ParticipantImpactViewModel, 'statusLabel' | 'tone' | 'contextLabel'> {
  const contextLabel = sanitizeContext(impact.publicContext)

  if (
    options.waitingParticipantId &&
    impact.participantId === options.waitingParticipantId
  ) {
    return {
      statusLabel: '응답 대기',
      tone: 'attention',
      contextLabel: contextLabel ?? '개인 보호 시간',
    }
  }

  switch (impact.status) {
    case 'required-available':
    case 'optional-available':
      return { statusLabel: '가능', tone: 'positive' }
    case 'required-confirmation':
      return {
        statusLabel: '확인 필요',
        tone: 'attention',
        contextLabel: contextLabel ?? '개인 보호 시간',
      }
    case 'optional-unavailable':
      return {
        statusLabel: '참석 어려움',
        tone: 'neutral',
        contextLabel,
      }
    case 'required-available-with-note':
    case 'optional-available-with-note': {
      const ctx = impact.publicContext ?? ''
      if (ctx.includes('점심') || ctx.includes('선호')) {
        return {
          statusLabel: '선호 반영',
          tone: 'neutral',
          contextLabel: sanitizeContext(ctx) ?? '점심 직후 회피',
        }
      }
      if (ctx.includes('외근 이후') || ctx.includes('이동')) {
        return {
          statusLabel: '외근 이후 가능',
          tone: 'neutral',
          contextLabel: '외근 이후 이동',
        }
      }
      if (ctx.includes('외근')) {
        return {
          statusLabel: '외근 회피',
          tone: 'neutral',
          contextLabel: sanitizeContext(ctx) ?? '외근',
        }
      }
      return {
        statusLabel: '가능',
        tone: 'neutral',
        contextLabel: sanitizeContext(ctx),
      }
    }
    default:
      return { statusLabel: '가능', tone: 'neutral', contextLabel }
  }
}

function mapParticipantRows(
  evaluation: SlotEvaluation,
  options: { waitingParticipantId?: string } = {},
): ParticipantImpactViewModel[] {
  return evaluation.participantImpacts.map((impact) => {
    const mapped = mapImpactStatus(impact, options)
    return {
      participantId: impact.participantId,
      name: impact.name,
      roleLabel: impact.attendanceType === 'required' ? '필수' : '선택',
      ...mapped,
    }
  })
}

function requiredSummary(evaluation: SlotEvaluation, allReady: boolean) {
  if (allReady) {
    return `필수 ${evaluation.requiredTotalCount}명 모두 가능`
  }
  return `필수 ${evaluation.requiredAvailableCount}명 가능`
}

function optionalSummary(evaluation: SlotEvaluation): string | null {
  if (evaluation.optionalTotalCount === 0) return null
  if (evaluation.optionalAvailableCount === evaluation.optionalTotalCount) {
    return `선택 ${evaluation.optionalTotalCount}명 모두 가능`
  }
  return `선택 ${evaluation.optionalTotalCount}명 중 ${evaluation.optionalAvailableCount}명 가능`
}

function buildBlockingRows(evaluations: SlotEvaluation[]) {
  let hardConflictSlots = 0
  let travelConflictSlots = 0
  let protectedSlots = 0

  for (const evaluation of evaluations) {
    if (evaluation.requiredHardConflictCount > 0) hardConflictSlots += 1
    const hasTravel = evaluation.participantImpacts.some(
      (i) =>
        i.attendanceType === 'required' &&
        (i.publicContext?.includes('외근') ?? false) &&
        i.status === 'required-available-with-note',
    )
    // Count hard-busy labeled 외근 among required conflicts via impacts
    const has외근Hard = evaluation.participantImpacts.some(
      (i) =>
        i.attendanceType === 'required' &&
        i.label.includes('일정 충돌') &&
        (i.publicContext === '외근' || i.publicContext?.includes('외근')),
    )
    if (has외근Hard || hasTravel) travelConflictSlots += 1
    if (evaluation.requiredConfirmationTargets.length > 0) protectedSlots += 1
  }

  const rows: Array<{ label: string; value: string }> = []
  if (hardConflictSlots > 0) {
    rows.push({
      label: '필수 일정 충돌',
      value: `${hardConflictSlots}개 시간`,
    })
  }
  if (travelConflictSlots > 0) {
    rows.push({
      label: '외근과 겹침',
      value: `${travelConflictSlots}개 시간`,
    })
  }
  if (protectedSlots === 0) {
    rows.push({
      label: '확인 가능한 보호 시간',
      value: '없음',
    })
  }
  if (rows.length === 0) {
    rows.push({
      label: '필수 참석자 가능 시간',
      value: '없음',
    })
  }
  return rows
}

function mobileSummary(evaluation: SlotEvaluation, allReady: boolean) {
  const req = requiredSummary(evaluation, allReady)
  const opt = optionalSummary(evaluation)
  return opt ? `${req} · ${opt}` : req
}

export function mapRecommendationToDecisionSurface(params: {
  mode: DecisionSurfaceMode
  recommendation: MeetingRecommendation
}): DecisionSurfaceViewModel {
  const { mode, recommendation } = params

  if (recommendation.status === 'NO_OPTION' || mode === 'no-option') {
    const blocking =
      recommendation.status === 'NO_OPTION'
        ? recommendation
        : null
    return {
      mode: 'no-option',
      contextLabel: CONTEXT,
      stateLabel:
        '현재 조건으로는 다음 주 안에 모두가 가능한 1시간을 찾기 어려워요.',
      summaryLines: [],
      supportingLabel: '필수 참석자나 가능한 조건을 다시 확인해주세요.',
      participantRows: [],
      confirmationCount: 0,
      reasonRows: [],
      reasonClosedLabel: '이 시간인 이유',
      reasonNote: REASON_NOTE,
      primaryAction: {
        label: '참석 조건 다시 보기',
        kind: 'edit-conditions',
      },
      peoplePanelTitle: '현재 조건에서 막히는 이유',
      blockingRows: blocking
        ? buildBlockingRows(blocking.evaluations)
        : [{ label: '필수 참석자 가능 시간', value: '없음' }],
      mobilePeopleSummary: '가능한 공통 시간 없음',
    }
  }

  const evaluation = recommendation.evaluation
  const confirmationCount =
    recommendation.status === 'NEED_CONFIRMATION'
      ? recommendation.confirmationTargets.length
      : evaluation.requiredConfirmationTargets.length

  const waitingId =
    mode === 'waiting'
      ? evaluation.requiredConfirmationTargets[0]?.participantId
      : undefined

  const participantRows = mapParticipantRows(evaluation, {
    waitingParticipantId: waitingId,
  })

  const summaryLines: string[] = []
  if (mode === 'ready' || mode === 'ready-after-confirmation') {
    summaryLines.push(requiredSummary(evaluation, true))
    const opt = optionalSummary(evaluation)
    if (opt) summaryLines.push(opt)
  }

  let stateLabel = ''
  let confirmationLine: string | undefined
  let supportingLabel: string | undefined
  let reasonClosedLabel = '이 시간인 이유'
  let primaryAction: DecisionSurfaceViewModel['primaryAction']

  switch (mode) {
    case 'ready':
      stateLabel = '바로 확정할 수 있어요.'
      primaryAction = { label: '이 시간으로 확정', kind: 'confirm' }
      break
    case 'ready-after-confirmation':
      stateLabel = '이제 확정할 수 있어요.'
      primaryAction = { label: '이 시간으로 확정', kind: 'confirm' }
      break
    case 'need-confirmation':
      stateLabel =
        confirmationCount > 1
          ? `확인 ${confirmationCount}번이면 필수 참석자가 모두 가능해요.`
          : '확인 한 번이면 필수 참석자 모두 가능해요.'
      confirmationLine = `개인 보호 시간 ${confirmationCount}건과 겹쳐요.`
      primaryAction = { label: '가능 여부 묻기', kind: 'request' }
      reasonClosedLabel = '왜 이 시간이 조율이 가장 적나요?'
      break
    case 'waiting':
      stateLabel = '응답을 기다리고 있어요.'
      supportingLabel =
        '확인되면 회의를 확정할 수 있는지 알려드릴게요.'
      break
    case 'next-alternative':
      stateLabel = '다음으로 조율이 적은 시간을 찾았어요.'
      supportingLabel = '이전 시간은 일정 확인이 어려워 제외했어요.'
      if (recommendation.status === 'READY') {
        primaryAction = { label: '이 시간으로 확정', kind: 'confirm' }
        summaryLines.push(requiredSummary(evaluation, true))
        const opt = optionalSummary(evaluation)
        if (opt) summaryLines.push(opt)
      } else {
        confirmationLine =
          confirmationCount > 0
            ? `개인 보호 시간 ${confirmationCount}건과 겹쳐요.`
            : undefined
        primaryAction = { label: '가능 여부 묻기', kind: 'request' }
        reasonClosedLabel = '왜 이 시간이 조율이 가장 적나요?'
      }
      break
    default:
      break
  }

  // Enrich reason rows: add confirmation row when needed
  const reasonRows = [...evaluation.reasonRows]
  if (
    confirmationCount > 0 &&
    !reasonRows.some((r) => r.key === 'confirmation')
  ) {
    reasonRows.splice(1, 0, {
      key: 'confirmation',
      label: '확인 필요',
      value: `개인 보호 시간 ${confirmationCount}건`,
    })
  }

  return {
    mode,
    contextLabel: CONTEXT,
    dateLabel: evaluation.slot.dateLabel,
    timeLabel: evaluation.slot.timeLabel,
    stateLabel,
    summaryLines,
    confirmationLine,
    supportingLabel,
    participantRows,
    confirmationCount,
    reasonRows: reasonRows.map((r) => ({ label: r.label, value: r.value })),
    reasonClosedLabel,
    reasonNote: REASON_NOTE,
    primaryAction,
    peoplePanelTitle: '이 시간에 6명은',
    mobilePeopleSummary: mobileSummary(
      evaluation,
      mode === 'ready' || mode === 'ready-after-confirmation',
    ),
  }
}
