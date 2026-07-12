import type { MeetingRecommendation, SlotEvaluation } from '../engine/decision-engine.types'

export const DISCLOSURE_NOTE =
  '필수 참석 가능 여부를 먼저 확인한 뒤, 추가 조율이 적은 순서로 비교했어요.'

export const CONTEXT_LABEL = '다음 주 · 1시간 · 6명'

export type UiDecisionView = {
  dateLabel: string
  timeLabel: string
  slotId: string
  requiredAvailable: number
  requiredTotal: number
  optionalAvailable: number
  optionalTotal: number
  confirmation?: {
    participantName: string
    participantId: string
    conflictLabel: string
    resultLabel: string
  }
  confirmationCount: number
  details: Array<{ label: string; value: string }>
  disclosureNote: string
  blockingSummary?: string
}

function fromEvaluation(
  evaluation: SlotEvaluation,
  confirmationIndex = 0,
): UiDecisionView {
  const targets = evaluation.requiredConfirmationTargets
  const target = targets[confirmationIndex]
  const requiredTotal = evaluation.requiredTotalCount

  return {
    dateLabel: evaluation.slot.dateLabel,
    timeLabel: evaluation.slot.timeLabel,
    slotId: evaluation.slot.id,
    requiredAvailable:
      targets.length === 0
        ? requiredTotal
        : evaluation.requiredAvailableCount,
    requiredTotal,
    optionalAvailable: evaluation.optionalAvailableCount,
    optionalTotal: evaluation.optionalTotalCount,
    confirmation: target
      ? {
          participantName: target.name,
          participantId: target.participantId,
          conflictLabel: target.publicLabel,
          resultLabel: `확인되면 필수 참석자 ${requiredTotal}명 모두 가능`,
        }
      : undefined,
    confirmationCount: targets.length,
    details: evaluation.reasonRows.map((row) => ({
      label: row.label,
      value: row.value,
    })),
    disclosureNote: DISCLOSURE_NOTE,
  }
}

export function recommendationToUi(
  recommendation: MeetingRecommendation,
): UiDecisionView {
  if (recommendation.status === 'NO_OPTION') {
    return {
      dateLabel: '',
      timeLabel: '',
      slotId: '',
      requiredAvailable: 0,
      requiredTotal: 0,
      optionalAvailable: 0,
      optionalTotal: 0,
      confirmationCount: 0,
      details: [],
      disclosureNote: DISCLOSURE_NOTE,
      blockingSummary: recommendation.blockingSummary,
    }
  }

  return fromEvaluation(recommendation.evaluation)
}

export function surfaceFromRecommendation(
  recommendation: MeetingRecommendation,
  options: { isNextAlternative?: boolean } = {},
): 'ready' | 'need-confirmation' | 'next-alternative' | 'no-option' {
  if (recommendation.status === 'NO_OPTION') return 'no-option'
  if (recommendation.status === 'READY') return 'ready'
  if (options.isNextAlternative) return 'next-alternative'
  return 'need-confirmation'
}
