import { Button } from '@/components/ui/Button'

type AttendeeReviewTransitionProps = {
  approved: boolean
  onContinue: () => void
}

/** Review-only step after attendee product confirmation. */
export function AttendeeReviewTransition({
  approved,
  onContinue,
}: AttendeeReviewTransitionProps) {
  return (
    <div
      className="mt-auto rounded-2xl border border-[#d1d6db] bg-[#eef0f3] px-5 py-5"
      aria-label="리뷰 내비게이션"
    >
      <p className="mb-1 text-[13px] font-semibold text-meeting-text-secondary">
        다음 장면
      </p>
      <p
        className="mb-4 text-[15px] leading-[23px] text-meeting-text"
        style={{ wordBreak: 'keep-all' }}
      >
        응답이 주최자에게 반영됐어요.
      </p>
      <Button onClick={onContinue}>
        {approved ? '확정 가능한 시간 보기' : '새로 계산된 시간 보기'}
      </Button>
    </div>
  )
}
