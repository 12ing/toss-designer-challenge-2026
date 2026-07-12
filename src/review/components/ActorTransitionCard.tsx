import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
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
  useEffect(() => {
    trackReviewEvent('actor_transition_opened', { variant })
  }, [variant])

  if (variant === 'to-attendee') {
    return (
      <aside
        className="fixed z-40 w-[min(100vw-2rem,360px)] rounded-2xl border border-[#d1d6db] bg-[#eef0f3] px-5 py-5 shadow-[0_12px_32px_rgba(0,27,55,0.12)] max-[719px]:inset-x-4 max-[719px]:bottom-4 max-[719px]:w-auto min-[720px]:right-6 min-[720px]:bottom-6"
        aria-label="리뷰 역할 전환"
        aria-live="polite"
      >
        <p className="mb-1 text-[12px] font-medium text-meeting-text-tertiary">
          Review
        </p>
        <p className="mb-1 text-[13px] font-semibold text-meeting-text-secondary">
          다음 장면
        </p>
        <p
          className="mb-4 text-[15px] leading-[23px] text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          {recipientName ?? '참석자'} 님에게 일정 확인 알림이 도착했어요.
        </p>
        <Link to={preserveModeQuery(href)} className="block">
          <Button type="button" variant="secondary">
            참석자 화면 보기
          </Button>
        </Link>
      </aside>
    )
  }

  const cta =
    variant === 'to-organizer-approved'
      ? '확정 가능한 시간 보기'
      : '새로 계산된 시간 보기'

  return (
    <div
      className="mx-auto mt-4 w-full max-w-[390px] rounded-2xl border border-[#d1d6db] bg-[#eef0f3] px-5 py-5"
      aria-label="리뷰 역할 전환"
      aria-live="polite"
    >
      <p className="mb-1 text-[12px] font-medium text-meeting-text-tertiary">
        Review
      </p>
      <p
        className="mb-4 text-[15px] leading-[23px] text-meeting-text"
        style={{ wordBreak: 'keep-all' }}
      >
        응답이 주최자에게 반영됐어요.
      </p>
      <Link to={preserveModeQuery(href)} className="block">
        <Button type="button" variant="secondary">
          {cta}
        </Button>
      </Link>
    </div>
  )
}
