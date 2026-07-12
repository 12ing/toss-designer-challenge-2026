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
    const name = recipientName ?? '참석자'
    return (
      <aside
        className="fixed z-40 w-[min(100vw-2rem,320px)] rounded-2xl border border-[#d1d6db] bg-[#eef0f3] px-4 py-4 shadow-[0_12px_32px_rgba(0,27,55,0.12)] animate-[review-panel-in_180ms_ease] motion-reduce:animate-none max-[719px]:inset-x-4 max-[719px]:bottom-[max(1rem,env(safe-area-inset-bottom))] max-[719px]:w-auto min-[720px]:right-6 min-[720px]:bottom-6"
        aria-label="참석자 응답 화면으로 이동"
        aria-live="polite"
      >
        <p
          className="mb-1.5 text-[15px] font-semibold leading-[22px] text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          참석자에게 확인 요청을 보냈어요
        </p>
        <p
          className="mb-4 text-[14px] leading-[21px] text-meeting-text-secondary"
          style={{ wordBreak: 'keep-all' }}
        >
          {name} 님의 응답 화면을 확인해보세요.
        </p>
        <Link to={preserveModeQuery(href)} className="block">
          <Button type="button" variant="primary" className="!min-h-[54px]">
            참석자 응답 보기
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
      aria-label="주최자 화면으로 이동"
      aria-live="polite"
    >
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
