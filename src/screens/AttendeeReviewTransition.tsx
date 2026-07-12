import { Button } from '@/components/ui/Button'
import { reviewCopy } from '@/copy/review.copy'

type AttendeeReviewTransitionProps = {
  /** Kept for call-site compatibility; CTA is unified. */
  approved?: boolean
  onContinue: () => void
}

/** Review-only step after attendee product confirmation. */
export function AttendeeReviewTransition({
  onContinue,
}: AttendeeReviewTransitionProps) {
  const copy = reviewCopy.actorTransition

  return (
    <div
      className="mt-auto rounded-2xl border border-[#d1d6db] bg-[#eef0f3] px-5 py-5"
      aria-label="리뷰 내비게이션"
    >
      <p
        className="mb-1.5 text-[15px] font-semibold leading-[22px] text-meeting-text"
        style={{ wordBreak: 'keep-all' }}
      >
        {copy.toOrganizerTitle}
      </p>
      <p
        className="mb-4 text-[14px] leading-[21px] text-meeting-text-secondary"
        style={{ wordBreak: 'keep-all' }}
      >
        {copy.toOrganizerDescription}
      </p>
      <Button onClick={onContinue}>{copy.toOrganizerCta}</Button>
    </div>
  )
}
