/**
 * Central product copy map — status labels, CTAs, and shared terms.
 * Keep Decision Surface, Lab, and completion screens aligned here.
 */

export const PRODUCT_TERMS = {
  requiredAttendee: '필수 참석자',
  optionalAttendee: '선택 참석자',
  scheduleCondition: '일정 조건',
  needsConfirmation: '확인 필요',
  waitingResponse: '응답 대기',
  attendanceHard: '참석 어려움',
  askAvailability: '가능 여부 묻기',
  confirmTime: '이 시간으로 확정',
  createMeeting: '회의 만들기',
  reviewConditions: '참석 조건 다시 보기',
} as const

export type SurfaceStatusKey =
  | 'READY'
  | 'NEED_CONFIRMATION'
  | 'WAITING'
  | 'READY_AFTER_CONFIRMATION'
  | 'NEXT_ALTERNATIVE'
  | 'NO_OPTION'

export type SurfaceStatusCopy = {
  stateLabel: string
  supportingLabel?: string
  primaryCta?: string
}

export const surfaceStatusCopy: Record<SurfaceStatusKey, SurfaceStatusCopy> = {
  READY: {
    stateLabel: '바로 확정할 수 있어요.',
    primaryCta: PRODUCT_TERMS.confirmTime,
  },
  NEED_CONFIRMATION: {
    stateLabel: '확인 한 번이면 필수 참석자가 모두 가능해요.',
    primaryCta: PRODUCT_TERMS.askAvailability,
  },
  WAITING: {
    stateLabel: '응답을 기다리고 있어요.',
    supportingLabel: '확인되면 회의를 확정할 수 있는지 알려드릴게요.',
  },
  READY_AFTER_CONFIRMATION: {
    stateLabel: '이제 확정할 수 있어요.',
    primaryCta: PRODUCT_TERMS.confirmTime,
  },
  NEXT_ALTERNATIVE: {
    stateLabel: '다음으로 조율이 적은 시간을 찾았어요.',
  },
  NO_OPTION: {
    stateLabel:
      '현재 조건으로는 필수 참석자가 모두 가능한 1시간을 찾기 어려워요.',
    primaryCta: PRODUCT_TERMS.reviewConditions,
  },
}

/** Multi-confirmation variant of NEED_CONFIRMATION state. */
export function needConfirmationStateLabel(count: number): string {
  if (count <= 1) return surfaceStatusCopy.NEED_CONFIRMATION.stateLabel
  return `확인 ${count}번이면 필수 참석자가 모두 가능해요.`
}

export const STATUS_LABELS = {
  available: '가능',
  needsConfirmation: PRODUCT_TERMS.needsConfirmation,
  waiting: PRODUCT_TERMS.waitingResponse,
  hard: PRODUCT_TERMS.attendanceHard,
} as const

export const ATTENDEE_ACTION_COPY = {
  approve: '이 시간 사용 가능',
  decline: '이 시간은 어려워요',
} as const

export const PAGE_TITLE =
  '회의 시간 결정 경험 · Toss Product Designer Challenge 2026'

export const PAGE_DESCRIPTION =
  '회의 시간은 모두가 비는 순간이 아니라, 무엇을 먼저 지킬지 정할 때 확정됩니다.'

export const REASON_NOTE =
  '필수 참석 가능 여부를 먼저 확인한 뒤, 추가 조율이 적은 시간을 골랐어요.'

export function requiredAttendeeSummary(
  available: number,
  total: number,
  allReady: boolean,
): string {
  if (allReady) return `${PRODUCT_TERMS.requiredAttendee} ${total}명 모두 가능`
  return `${PRODUCT_TERMS.requiredAttendee} ${available}명 가능`
}

export function optionalAttendeeSummary(
  available: number,
  total: number,
): string | null {
  if (total === 0) return null
  if (available === total) {
    return `${PRODUCT_TERMS.optionalAttendee} ${total}명 모두 가능`
  }
  return `${PRODUCT_TERMS.optionalAttendee} ${total}명 중 ${available}명 가능`
}
