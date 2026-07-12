/**
 * Product UX writing — 해요체, 표준 용어.
 * Review / recovery copy lives in sibling modules.
 */

export const PRODUCT_TERMS = {
  requiredAttendee: '필수 참석자',
  optionalAttendee: '선택 참석자',
  scheduleCondition: '일정 조건',
  needsConfirmation: '확인 필요',
  waitingResponse: '응답 대기',
  attendanceHard: '참석 어려움',
  available: '가능',
  askConfirmation: '확인 요청하기',
  sendConfirmationRequest: '확인 요청 보내기',
  confirmTime: '이 시간으로 확정',
  createMeeting: '회의 만들기',
  creatingMeeting: '만드는 중',
  reviewConditions: '참석 조건 다시 보기',
  findTime: '이 조건으로 시간 찾기',
  peoplePanel: '참석 상황',
  peopleView: '참석 상황 보기',
  reasonPanel: '이 시간을 고른 이유',
  meetingAttendees: '회의 참석자',
  complete: '완료',
  joinVideoMeeting: '화상 회의 참여하기',
  /** @deprecated Use askConfirmation */
  askAvailability: '확인 요청하기',
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
    stateLabel: '한 분만 확인하면 필수 참석자가 모두 가능해요.',
    primaryCta: PRODUCT_TERMS.askConfirmation,
  },
  WAITING: {
    stateLabel: '응답을 기다리고 있어요.',
    supportingLabel: '응답이 오면 회의를 확정할 수 있는지 알려드릴게요.',
  },
  READY_AFTER_CONFIRMATION: {
    stateLabel: '이제 확정할 수 있어요.',
    primaryCta: PRODUCT_TERMS.confirmTime,
  },
  NEXT_ALTERNATIVE: {
    stateLabel: '거절 응답을 반영해 다음 시간을 찾았어요.',
    supportingLabel:
      '이전 시간은 참석하기 어렵다는 응답을 반영해 제외했어요.',
  },
  NO_OPTION: {
    stateLabel:
      '현재 조건으로는 필수 참석자가 모두 가능한 1시간을 찾기 어려워요.',
    supportingLabel: '참석 조건을 조정하면 다시 찾아볼게요.',
    primaryCta: PRODUCT_TERMS.reviewConditions,
  },
}

export function needConfirmationStateLabel(count: number): string {
  if (count <= 1) {
    return '한 분만 확인하면 필수 참석자가 모두 가능해요.'
  }
  return `${count}명에게 확인하면 필수 참석자가 모두 가능해요.`
}

export const STATUS_LABELS = {
  available: PRODUCT_TERMS.available,
  needsConfirmation: PRODUCT_TERMS.needsConfirmation,
  waiting: PRODUCT_TERMS.waitingResponse,
  hard: PRODUCT_TERMS.attendanceHard,
} as const

export const ATTENDEE_ACTION_COPY = {
  approve: '참석할 수 있어요',
  decline: '참석하기 어려워요',
  delivering: '전달하는 중',
} as const

export const PAGE_TITLE =
  '회의 시간 결정 경험 · Toss Product Designer Challenge 2026'

export const PAGE_DESCRIPTION =
  '회의 시간은 모두가 비는 순간이 아니라, 무엇을 먼저 지킬지 정할 때 확정돼요.'

export const REASON_NOTE =
  '필수 참석 가능 여부를 먼저 확인하고, 추가 조율이 적은 시간을 골랐어요.'

export const productCopy = {
  setup: {
    title: '참석 조건을 확인해주세요',
    description:
      '필수 참석은 지키고, 선택 참석자가 더 많이 가능한 시간을 찾을게요.',
    meta: '다음 주 · 1시간',
    columnParticipant: '참석자',
    columnCondition: '일정 조건',
    columnAttendance: '참석 구분',
    primaryAction: PRODUCT_TERMS.findTime,
    organizerFixed: '주최자 · 필수 고정',
  },
  analyzing: {
    title: '조건에 맞는 시간을 찾고 있어요.',
    description:
      '필수 참석을 먼저 지키고, 외근·개인 선호·선택 참석 가능 여부를 함께 비교하고 있어요.',
    secondary:
      '공통 시간이 없으면 확인이 가장 적게 필요한 시간까지 찾아볼게요.',
  },
  surface: {
    context: '다음 주 · 1시간 · 6명',
    peopleTitle: PRODUCT_TERMS.peoplePanel,
    peopleView: PRODUCT_TERMS.peopleView,
    reasonTitle: PRODUCT_TERMS.reasonPanel,
    confirmationOverlap: (count: number) =>
      count <= 1
        ? '개인 보호 시간과 겹쳐요.'
        : `개인 보호 시간 ${count}건과 겹쳐요.`,
    confirmationTarget: (name: string) => `확인 대상 · ${name}`,
    protectedTime: '개인 보호 시간',
    noOptionPanelTitle: '현재 조건에서 어려운 이유',
    noOptionReason1:
      '필수 참석자들의 고정 일정 때문에 공통으로 비는 시간이 없어요.',
    noOptionReason2:
      '외근 시간을 제외하면 1시간 연속으로 가능한 구간이 없어요.',
    noOptionMobileSummary: '가능한 공통 시간 없음',
    reasonRequiredLabel: '필수 참석 조건',
    reasonTravelLabel: '이동 일정',
    reasonTravelValue: '외근 이후 이동 시간을 반영했어요',
    reasonOptionalLabel: '선택 참석자',
    reasonOptionalAllAvailable: (n: number) =>
      `${n}명 모두 참석할 수 있어요`,
    reasonNote: REASON_NOTE,
  },
  requestPreview: {
    title: (name: string) => `${name} 님에게 확인을 요청할까요?`,
    body: (date: string, time: string) =>
      `${date} ${time}에\n참석할 수 있는지 물어볼게요.`,
    privacy:
      '개인 일정의 내용과 응답 사유는 다른 사람에게 공개되지 않아요.',
    primaryAction: PRODUCT_TERMS.sendConfirmationRequest,
    secondaryAction: '돌아가기',
  },
  attendeeRequest: {
    title: '이 시간, 괜찮으세요?',
    description: (organizerName: string) =>
      `${organizerName} 님이 회의 참석 가능 여부를 물었어요.`,
    conflict: (label: string) => `${label}과 겹쳐요.`,
    privacy:
      '일정 내용과 응답 사유는 다른 사람에게 공개되지 않아요.',
    approve: ATTENDEE_ACTION_COPY.approve,
    decline: ATTENDEE_ACTION_COPY.decline,
    delivering: ATTENDEE_ACTION_COPY.delivering,
  },
  attendeeResult: {
    approved: {
      title: '참석할 수 있다고 전달했어요.',
      description: '주최자가 회의를 확정하면\n일정이 만들어져요.',
    },
    declined: {
      title: '참석하기 어렵다고 전달했어요.',
      description: '다른 시간을 다시 찾아볼게요.',
    },
  },
  meetingDetails: {
    title: '이 시간으로 회의를 만들까요?',
    titleField: '회의 제목',
    titlePlaceholder: '회의 제목을 입력하세요',
    titleError: '회의 제목을 입력해 주세요.',
    locationField: '장소 또는 화상 회의 링크',
    locationPlaceholder: '예: 4층 A 또는 화상 회의 링크',
    primaryAction: PRODUCT_TERMS.createMeeting,
    creating: PRODUCT_TERMS.creatingMeeting,
    secondaryAction: PRODUCT_TERMS.reviewConditions,
  },
  productCompletion: {
    title: '회의를 만들었어요.',
    joinVideo: PRODUCT_TERMS.joinVideoMeeting,
    primaryAction: PRODUCT_TERMS.complete,
  },
  privacy: {
    tooltipTitle: '공유되는 일정 조건',
    line1: '외근이나 선호 시간처럼 조율에 필요한 정보만 보여줘요.',
    line2: '일정 제목과 상세 사유는 공유하지 않아요.',
  },
} as const

/** @deprecated Prefer formatAttendanceSummary in formatters.ts */
export function requiredAttendeeSummary(
  available: number,
  total: number,
  allReady: boolean,
): string {
  if (allReady) return `${PRODUCT_TERMS.requiredAttendee} ${total}명 모두 가능`
  return `${PRODUCT_TERMS.requiredAttendee} ${available}명 가능`
}

/** @deprecated Prefer formatters */
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
