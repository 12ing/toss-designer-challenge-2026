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

export type ImpactTone = 'positive' | 'neutral' | 'attention' | 'waiting'

export type StatusLabel =
  | '가능'
  | '확인 필요'
  | '응답 대기'
  | '참석 어려움'

export type ParticipantImpactViewModel = {
  participantId: string
  name: string
  roleLabel: '필수' | '선택'
  statusLabel: StatusLabel
  contextLabel?: string
  tone: ImpactTone
  isConfirmationTarget: boolean
  accessibleLabel: string
}

export type ConfirmationTargetSummary = {
  count: number
  name: string
  contextLabel: string
}

export type DecisionSurfaceViewModel = {
  mode: DecisionSurfaceMode
  contextLabel: string
  dateLabel?: string
  timeLabel?: string
  stateLabel: string
  summaryLines: string[]
  confirmationLine?: string
  confirmationTarget?: ConfirmationTargetSummary
  supportingLabel?: string
  participantRows: ParticipantImpactViewModel[]
  requiredRows: ParticipantImpactViewModel[]
  optionalRows: ParticipantImpactViewModel[]
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
  mobileConfirmationHint?: string
}

const CONTEXT = '다음 주 · 1시간 · 6명'
const REASON_NOTE =
  '필수 참석 가능 여부를 먼저 확인한 뒤, 추가 조율이 적은 시간을 골랐어요.'
const REASON_CLOSED_LABEL = '이 시간을 고른 이유'

const ALLOWED_CONTEXT = new Set([
  '개인 보호 시간',
  '점심 직후 회피',
  '점심 직후 회피 반영',
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
  if (raw.includes('점심')) return '점심 직후 회피 반영'
  if (raw.includes('외근 이후') || raw.includes('이동')) return '외근 이후 이동'
  if (raw.includes('외근')) return '외근'
  if (raw.includes('고객')) return '고객 대응'
  if (raw.includes('연속')) return '연속 회의'
  return '일정 있음'
}

function mapImpactStatus(
  impact: ParticipantImpact,
  options: { waitingParticipantId?: string },
): Pick<
  ParticipantImpactViewModel,
  'statusLabel' | 'tone' | 'contextLabel' | 'isConfirmationTarget'
> {
  const baseContext = sanitizeContext(impact.publicContext)

  if (
    options.waitingParticipantId &&
    impact.participantId === options.waitingParticipantId
  ) {
    return {
      statusLabel: '응답 대기',
      tone: 'waiting',
      contextLabel: baseContext ?? '개인 보호 시간',
      isConfirmationTarget: true,
    }
  }

  switch (impact.status) {
    case 'required-available':
    case 'optional-available':
      return {
        statusLabel: '가능',
        tone: 'positive',
        isConfirmationTarget: false,
      }
    case 'required-confirmation':
      return {
        statusLabel: '확인 필요',
        tone: 'attention',
        contextLabel: baseContext ?? '개인 보호 시간',
        isConfirmationTarget: true,
      }
    case 'optional-unavailable':
      return {
        statusLabel: '참석 어려움',
        tone: 'neutral',
        contextLabel: baseContext,
        isConfirmationTarget: false,
      }
    case 'required-available-with-note':
    case 'optional-available-with-note': {
      const ctx = impact.publicContext ?? ''
      let contextLabel = sanitizeContext(ctx)
      if (ctx.includes('점심') || ctx.includes('선호')) {
        contextLabel = '점심 직후 회피'
      } else if (ctx.includes('외근 이후') || ctx.includes('이동')) {
        contextLabel = '외근 이후 이동'
      }
      return {
        statusLabel: '가능',
        tone: 'positive',
        contextLabel,
        isConfirmationTarget: false,
      }
    }
    default:
      return {
        statusLabel: '가능',
        tone: 'neutral',
        contextLabel: baseContext,
        isConfirmationTarget: false,
      }
  }
}

function mapParticipantRows(
  evaluation: SlotEvaluation,
  options: { waitingParticipantId?: string } = {},
): ParticipantImpactViewModel[] {
  return evaluation.participantImpacts.map((impact) => {
    const mapped = mapImpactStatus(impact, options)
    const roleLabel = impact.attendanceType === 'required' ? '필수' : '선택'
    const accessibleLabel = [
      impact.name,
      `${roleLabel} 참석자`,
      mapped.statusLabel,
      mapped.contextLabel,
    ]
      .filter(Boolean)
      .join(', ')

    return {
      participantId: impact.participantId,
      name: impact.name,
      roleLabel,
      ...mapped,
      accessibleLabel,
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

/**
 * Surface-facing reason rows — max 3, no score/penalty, hide non-impactful items.
 * Engine reasonRows remain the source of travel/preference signals.
 */
function buildDisplayReasonRows(
  evaluation: SlotEvaluation,
): Array<{ label: string; value: string }> {
  const confirmCount = evaluation.requiredConfirmationTargets.length
  const available = evaluation.requiredAvailableCount
  const total = evaluation.requiredTotalCount

  const rows: Array<{ label: string; value: string }> = []

  const requiredValue =
    confirmCount === 0 && available === total
      ? `${total}명 모두 가능해요`
      : confirmCount > 0
        ? `현재 가능한 ${available}명 · ${confirmCount}명 확인 필요`
        : `현재 가능한 ${available}명`
  rows.push({ label: '필수 참석 조건', value: requiredValue })

  const travel = evaluation.reasonRows.find((row) => row.key === 'travel')
  if (travel?.value.includes('반영')) {
    rows.push({
      label: '이동 일정',
      value: '외근 이후 이동 시간을 반영했어요',
    })
  }

  if (evaluation.optionalTotalCount > 0) {
    const { optionalAvailableCount, optionalTotalCount } = evaluation
    rows.push({
      label: '선택 참석자',
      value:
        optionalAvailableCount === optionalTotalCount
          ? `${optionalTotalCount}명 모두 참석할 수 있어요`
          : `${optionalTotalCount}명 중 ${optionalAvailableCount}명 참석할 수 있어요`,
    })
  }

  return rows.slice(0, 3)
}

function buildBlockingRows(
  evaluations: SlotEvaluation[],
  options: { debug?: boolean } = {},
) {
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
    const has외근Hard = evaluation.participantImpacts.some(
      (i) =>
        i.attendanceType === 'required' &&
        i.label.includes('일정 충돌') &&
        (i.publicContext === '외근' || i.publicContext?.includes('외근')),
    )
    if (has외근Hard || hasTravel) travelConflictSlots += 1
    if (evaluation.requiredConfirmationTargets.length > 0) protectedSlots += 1
  }

  if (options.debug) {
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

  const rows: Array<{ label: string; value: string }> = [
    {
      label: '필수 참석자의 고정 일정이 겹쳐요.',
      value: '',
    },
    {
      label: '외근 전후 이동 시간을 피하면 1시간 연속으로 가능한 시간이 없어요.',
      value: '',
    },
  ]
  if (protectedSlots === 0) {
    rows.push({
      label: '확인을 요청할 수 있는 보호 시간도 없어요.',
      value: '',
    })
  }
  return rows
}

function isDebugMode() {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('debug') === '1'
}

function buildMobileSummary(
  mode: DecisionSurfaceMode,
  evaluation: SlotEvaluation,
  confirmationCount: number,
): { summary: string; confirmationHint?: string } {
  if (mode === 'need-confirmation' || mode === 'waiting' || mode === 'next-alternative') {
    const confirmNeeded = confirmationCount
    const requiredAvailable = evaluation.requiredAvailableCount
    const summary =
      confirmNeeded > 0
        ? `필수 ${requiredAvailable}명 가능 · ${confirmNeeded}명 확인 필요`
        : requiredSummary(evaluation, false)
    const target = evaluation.requiredConfirmationTargets[0]
    return {
      summary,
      confirmationHint: target
        ? `확인 대상 · ${target.name}`
        : undefined,
    }
  }

  const req = requiredSummary(evaluation, true)
  const opt = optionalSummary(evaluation)
  return { summary: opt ? `${req}\n${opt}` : req }
}

export function mapRecommendationToDecisionSurface(params: {
  mode: DecisionSurfaceMode
  recommendation: MeetingRecommendation
}): DecisionSurfaceViewModel {
  const { mode, recommendation } = params

  if (recommendation.status === 'NO_OPTION' || mode === 'no-option') {
    const blocking =
      recommendation.status === 'NO_OPTION' ? recommendation : null
    const debug = isDebugMode()
    return {
      mode: 'no-option',
      contextLabel: CONTEXT,
      stateLabel:
        '현재 조건으로는 필수 참석자가 모두 가능한 1시간을 찾기 어려워요.',
      summaryLines: [],
      supportingLabel: '참석 조건을 조정하면 다시 찾아볼게요.',
      participantRows: [],
      requiredRows: [],
      optionalRows: [],
      confirmationCount: 0,
      reasonRows: [],
      reasonClosedLabel: REASON_CLOSED_LABEL,
      reasonNote: REASON_NOTE,
      primaryAction: {
        label: '참석 조건 다시 보기',
        kind: 'edit-conditions',
      },
      peoplePanelTitle: '현재 조건에서 막히는 이유',
      blockingRows: blocking
        ? buildBlockingRows(blocking.evaluations, { debug })
        : [
            {
              label: '필수 참석자의 고정 일정이 겹쳐요.',
              value: '',
            },
          ],
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
  const requiredRows = participantRows.filter((r) => r.roleLabel === '필수')
  const optionalRows = participantRows.filter((r) => r.roleLabel === '선택')

  const firstTarget =
    evaluation.requiredConfirmationTargets[0] ??
    (recommendation.status === 'NEED_CONFIRMATION'
      ? recommendation.confirmationTargets[0]
      : undefined)

  const confirmationTarget: ConfirmationTargetSummary | undefined =
    firstTarget &&
    (mode === 'need-confirmation' ||
      mode === 'waiting' ||
      mode === 'next-alternative')
      ? {
          count: Math.max(confirmationCount, 1),
          name: firstTarget.name,
          contextLabel: firstTarget.publicLabel,
        }
      : undefined

  const summaryLines: string[] = []
  if (mode === 'ready' || mode === 'ready-after-confirmation') {
    summaryLines.push(requiredSummary(evaluation, true))
    const opt = optionalSummary(evaluation)
    if (opt) summaryLines.push(opt)
  }

  let stateLabel = ''
  let confirmationLine: string | undefined
  let supportingLabel: string | undefined
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
      }
      break
    default:
      break
  }

  const mobile = buildMobileSummary(mode, evaluation, confirmationCount)

  return {
    mode,
    contextLabel: CONTEXT,
    dateLabel: evaluation.slot.dateLabel,
    timeLabel: evaluation.slot.timeLabel,
    stateLabel,
    summaryLines,
    confirmationLine,
    confirmationTarget,
    supportingLabel,
    participantRows,
    requiredRows,
    optionalRows,
    confirmationCount,
    reasonRows: buildDisplayReasonRows(evaluation),
    reasonClosedLabel: REASON_CLOSED_LABEL,
    reasonNote: REASON_NOTE,
    primaryAction,
    peoplePanelTitle: '이 시간의 참석 상황',
    mobilePeopleSummary: mobile.summary,
    mobileConfirmationHint: mobile.confirmationHint,
  }
}
