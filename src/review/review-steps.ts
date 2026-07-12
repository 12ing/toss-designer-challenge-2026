import type { ConnectedFlowPhase } from '@/features/meeting-decision/connected-flow/connected-flow.types'
import type { DecisionState } from '@/types/schedule'
import type { ReviewStep, ReviewStepMeta } from './review.types'

const STEP_ORDER: ReviewStep[] = [
  'attendance-conditions',
  'time-recommendation',
  'confirmation-request',
  'attendee-response',
  'meeting-confirmation',
]

const STEP_LABELS: Record<ReviewStep, string> = {
  'attendance-conditions': '참석 조건',
  'time-recommendation': '시간 제안',
  'confirmation-request': '확인 요청',
  'attendee-response': '참석자 응답',
  'meeting-confirmation': '회의 확정',
}

export function reviewStepFromPhase(phase: ConnectedFlowPhase): ReviewStep {
  switch (phase) {
    case 'participant-setup':
      return 'attendance-conditions'
    case 'analyzing':
    case 'organizer-result':
      return 'time-recommendation'
    case 'request-preview':
    case 'sending-request':
    case 'organizer-waiting':
      return 'confirmation-request'
    case 'attendee-request':
    case 'attendee-submitting':
    case 'attendee-approved':
    case 'attendee-declined':
      return 'attendee-response'
    case 'organizer-updated-result':
    case 'meeting-details':
    case 'completed':
    case 'review-complete':
      return 'meeting-confirmation'
    default:
      return 'time-recommendation'
  }
}

export function reviewStepFromLegacyState(state: DecisionState): ReviewStep {
  switch (state) {
    case 'participant-setup':
      return 'attendance-conditions'
    case 'analyzing':
    case 'ready':
    case 'need-confirmation':
    case 'next-alternative':
    case 'ready-after-confirmation':
    case 'no-option':
      return 'time-recommendation'
    case 'request-preview':
    case 'waiting':
      return 'confirmation-request'
    case 'attendee-request':
    case 'attendee-approved':
    case 'attendee-rejected':
      return 'attendee-response'
    case 'meeting-details':
    case 'completed':
    case 'review-complete':
      return 'meeting-confirmation'
    default:
      return 'time-recommendation'
  }
}

export function getReviewStepMeta(step: ReviewStep): ReviewStepMeta {
  const index = STEP_ORDER.indexOf(step) + 1
  return {
    id: step,
    index,
    total: STEP_ORDER.length,
    label: STEP_LABELS[step],
  }
}

export function formatReviewStepLabel(step: ReviewStep): string {
  const meta = getReviewStepMeta(step)
  return `핵심 흐름 ${meta.index}/${meta.total} · ${meta.label}`
}
