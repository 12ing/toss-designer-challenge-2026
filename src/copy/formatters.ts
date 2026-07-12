import { PRODUCT_TERMS } from './product.copy'

/** 필수 참석자 N명 · 선택 참석자 M명 */
export function formatAttendanceSummary(
  requiredCount: number,
  optionalCount: number,
): string {
  if (optionalCount === 0) {
    return `${PRODUCT_TERMS.requiredAttendee} ${requiredCount}명 · ${PRODUCT_TERMS.optionalAttendee} 없음`
  }
  return `${PRODUCT_TERMS.requiredAttendee} ${requiredCount}명 · ${PRODUCT_TERMS.optionalAttendee} ${optionalCount}명`
}

export function formatNameWithHonorific(name: string): string {
  return `${name} 님`
}

export function formatMeetingAttendeeTotal(count: number): string {
  return `${PRODUCT_TERMS.meetingAttendees} ${count}명`
}

export function formatRequiredAttendeeHeading(count: number): string {
  return `${PRODUCT_TERMS.requiredAttendee} ${count}명`
}

export function formatOptionalAttendeeHeading(count: number): string {
  if (count === 0) return `${PRODUCT_TERMS.optionalAttendee} 없음`
  return `${PRODUCT_TERMS.optionalAttendee} ${count}명`
}

export function formatReasonRequiredValue(
  available: number,
  total: number,
  confirmCount: number,
): string {
  if (confirmCount === 0 && available === total) {
    return `${total}명 모두 가능해요`
  }
  if (confirmCount > 0) {
    return `현재 가능한 ${available}명 · ${confirmCount}명 확인 필요`
  }
  return `현재 가능한 ${available}명`
}
