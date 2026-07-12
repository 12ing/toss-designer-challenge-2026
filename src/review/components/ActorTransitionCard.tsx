import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { reviewCopy } from '@/copy/review.copy'
import { trackReviewEvent } from '@/review/review-analytics'
import { preserveModeQuery } from '@/review/review-mode'

type ActorTransitionCardProps = {
  variant: 'to-attendee' | 'to-organizer-approved' | 'to-organizer-declined'
  recipientName?: string
  dateLabel?: string
  timeLabel?: string
  href: string
}

export function ActorTransitionCard({
  variant,
  recipientName,
  href,
}: ActorTransitionCardProps) {
  const copy = reviewCopy.actorTransition

  useEffect(() => {
    trackReviewEvent('actor_transition_opened', { variant })
  }, [variant])

  if (variant === 'to-attendee') {
    const name = recipientName ?? '참석자'
    return (
      <aside
        className="fixed z-40 w-[min(100vw-2rem,320px)] rounded-[18px] border border-meeting-divider bg-meeting-surface px-4 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)] animate-[review-panel-in_180ms_ease] motion-reduce:animate-none max-[719px]:inset-x-4 max-[719px]:bottom-[max(1rem,env(safe-area-inset-bottom))] max-[719px]:w-auto min-[720px]:right-6 min-[720px]:bottom-6"
        aria-label="참석자 응답 화면으로 이동"
        tabIndex={-1}
      >
        <p
          className="mb-1.5 text-[15px] font-semibold leading-[22px] text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          {copy.toAttendeeTitle(name)}
        </p>
        <p
          className="mb-4 text-[14px] leading-[21px] text-meeting-text-secondary"
          style={{ wordBreak: 'keep-all' }}
        >
          {copy.toAttendeeDescription}
        </p>
        <Link to={preserveModeQuery(href)} className="block">
          <Button type="button" variant="primary" className="!min-h-[54px]">
            {copy.toAttendeeCta}
          </Button>
        </Link>
      </aside>
    )
  }

  return (
    <div
      className="mx-auto mt-4 w-full max-w-[390px] rounded-[18px] border border-meeting-divider bg-meeting-surface px-5 py-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
      aria-label="주최자 화면으로 이동"
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
      <Link to={preserveModeQuery(href)} className="block">
        <Button type="button" variant="secondary">
          {copy.toOrganizerCta}
        </Button>
      </Link>
    </div>
  )
}
