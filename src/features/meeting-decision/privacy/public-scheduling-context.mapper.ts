export type PublicSchedulingContextKind =
  | 'protected-time'
  | 'lunch-preference'
  | 'offsite'
  | 'customer-response'
  | 'meeting-density'
  | 'none'

export type PublicSchedulingContext = {
  kind: PublicSchedulingContextKind
  shortLabel: string
  supportingLabel?: string
}

export type InternalScheduleContext = {
  participantId: string
  /** 내부용 — UI에 직접 노출 금지 */
  privateLabels?: string[]
  hints?: PublicSchedulingContextKind[]
}

const FORBIDDEN_SUBSTRINGS = [
  '병원',
  '가족',
  '개인 약속',
  '상담',
  '거절 사유',
  '진료',
]

const ALLOWED_LABELS = new Set([
  '개인 보호 시간 있음',
  '점심 직후 선호하지 않음',
  '화·목 외근',
  '외근 이후 이동',
  '수요일 오후 고객 대응',
  '연속 회의가 많은 시간',
  '공유된 조건 없음',
  '주최자 · 필수 고정',
  '일정 있음',
])

/** 참가자별 공개 가능한 기본 맥락 (프라이버시 매퍼 결과) */
const DEFAULT_PUBLIC_CONTEXT: Record<string, PublicSchedulingContext> = {
  minji: {
    kind: 'none',
    shortLabel: '주최자 · 필수 고정',
  },
  jihoon: {
    kind: 'protected-time',
    shortLabel: '개인 보호 시간 있음',
  },
  seoyeon: {
    kind: 'lunch-preference',
    shortLabel: '점심 직후 선호하지 않음',
  },
  doyoon: {
    kind: 'offsite',
    shortLabel: '화·목 외근',
  },
  yujin: {
    kind: 'none',
    shortLabel: '공유된 조건 없음',
  },
  hyunwoo: {
    kind: 'customer-response',
    shortLabel: '수요일 오후 고객 대응',
  },
}

function containsForbidden(text: string) {
  return FORBIDDEN_SUBSTRINGS.some((token) => text.includes(token))
}

/**
 * 내부 일정 힌트를 공개 가능한 맥락으로 변환합니다.
 * raw event title을 그대로 반환하지 않습니다.
 */
export function mapPrivateScheduleToPublicContext(
  source: InternalScheduleContext,
): PublicSchedulingContext {
  const fallback = DEFAULT_PUBLIC_CONTEXT[source.participantId] ?? {
    kind: 'none' as const,
    shortLabel: '공유된 조건 없음',
  }

  if (source.privateLabels?.some(containsForbidden)) {
    return { kind: 'none', shortLabel: '일정 있음' }
  }

  if (source.hints?.includes('protected-time')) {
    return { kind: 'protected-time', shortLabel: '개인 보호 시간 있음' }
  }
  if (source.hints?.includes('lunch-preference')) {
    return { kind: 'lunch-preference', shortLabel: '점심 직후 선호하지 않음' }
  }
  if (source.hints?.includes('offsite')) {
    return { kind: 'offsite', shortLabel: '화·목 외근' }
  }
  if (source.hints?.includes('customer-response')) {
    return { kind: 'customer-response', shortLabel: '수요일 오후 고객 대응' }
  }
  if (source.hints?.includes('meeting-density')) {
    return { kind: 'meeting-density', shortLabel: '연속 회의가 많은 시간' }
  }

  if (!ALLOWED_LABELS.has(fallback.shortLabel)) {
    return { kind: 'none', shortLabel: '공유된 조건 없음' }
  }

  return fallback
}

export function getPublicContextForParticipant(
  participantId: string,
): PublicSchedulingContext {
  return mapPrivateScheduleToPublicContext({ participantId })
}

/** 테스트/회귀용: 금칙 문자열이 공개 라벨에 섞였는지 검사 */
export function assertPublicLabelSafe(label: string): boolean {
  if (containsForbidden(label)) return false
  return ALLOWED_LABELS.has(label) || label === '일정 있음'
}
