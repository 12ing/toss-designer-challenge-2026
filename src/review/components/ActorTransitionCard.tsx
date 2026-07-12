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
  dateLabel,
  timeLabel,
  href,
}: ActorTransitionCardProps) {
  useEffect(() => {
    trackReviewEvent('actor_transition_opened', { variant })
  }, [variant])

  if (variant === 'to-attendee') {
    return (
      <div
        className="mx-auto mt-6 w-full max-w-[640px] rounded-2xl border border-[#d1d6db] bg-[#eef0f3] px-5 py-5"
        aria-label="리뷰 역할 전환"
      >
        <p className="mb-1 text-[13px] font-semibold text-meeting-text-secondary">
          다음 장면
        </p>
        <p
          className="mb-3 text-[15px] leading-[23px] text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          {recipientName ?? '참석자'} 님에게 일정 확인 알림이 도착했어요.
        </p>
        {recipientName && dateLabel && timeLabel ? (
          <div className="mb-4 rounded-xl border border-meeting-divider bg-meeting-surface px-4 py-3">
            <p className="mb-1 text-[12px] font-medium text-meeting-text-tertiary">
              알림 미리보기
            </p>
            <p className="text-[14px] font-semibold text-meeting-text">
              회의 시간 확인
            </p>
            <p className="mt-1 text-[13px] leading-5 text-meeting-text-secondary">
              김민지 님이 일정 가능 여부를 물었어요.
            </p>
            <p className="mt-1 text-[13px] leading-5 text-meeting-text-secondary">
              {dateLabel} · {timeLabel}
            </p>
          </div>
        ) : null}
        <Link to={preserveModeQuery(href)} className="block">
          <Button variant="secondary">참석자 알림 열기</Button>
        </Link>
      </div>
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
    >
      <p
        className="mb-4 text-[15px] leading-[23px] text-meeting-text"
        style={{ wordBreak: 'keep-all' }}
      >
        응답이 주최자에게 반영됐어요.
      </p>
      <Link to={preserveModeQuery(href)} className="block">
        <Button variant="secondary">{cta}</Button>
      </Link>
    </div>
  )
}
