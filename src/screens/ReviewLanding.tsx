import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { trackReviewEvent } from '@/review/review-analytics'
import {
  organizerPath,
  startCoreReviewSession,
} from '@/review/review-session.factory'

export function ReviewLanding() {
  const navigate = useNavigate()

  useEffect(() => {
    trackReviewEvent('review_landing_viewed')
    document.title =
      '6명의 회의 시간 정하기 | Toss Product Designer Challenge 2026'
  }, [])

  const startCoreFlow = () => {
    const session = startCoreReviewSession()
    navigate(organizerPath(session.id), { replace: true })
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-meeting-bg">
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col justify-center px-5 py-12 min-[640px]:px-8">
        <p className="mb-4 text-[13px] font-medium leading-5 tracking-wide text-meeting-text-tertiary">
          Toss Product Designer Challenge 2026
        </p>

        <h1
          className="mb-7 max-w-[520px] text-[clamp(1.5rem,4.5vw,2rem)] font-bold leading-[1.35] tracking-tight text-meeting-text"
          style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
        >
          회의 일정은 빈 시간을 찾는 일이 아니라,
          <br />
          무엇을 먼저 지킬지 결정하는 일입니다.
        </h1>

        <p
          className="mb-9 max-w-[520px] text-[16px] leading-6 text-meeting-text-secondary"
          style={{ wordBreak: 'keep-all' }}
        >
          필수 참석은 지키고, 외근과 개인 선호는 필요한 만큼 반영해
          <br />
          가장 적은 조율로 확정할 수 있는 시간과 다음 행동을 제안했습니다.
        </p>

        <div className="w-full min-w-0 max-w-md">
          <Button onClick={startCoreFlow}>핵심 플로우 시작</Button>
          <p
            className="mt-2.5 text-[13px] leading-5 text-meeting-text-tertiary"
            style={{ wordBreak: 'keep-all' }}
          >
            약 2분 · 공통 시간이 없는 상황부터 시작해요
          </p>
          <Link
            to="/lab"
            className="mt-8 inline-flex min-h-11 items-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
            style={{ wordBreak: 'keep-all' }}
            onClick={() => trackReviewEvent('rule_lab_opened')}
          >
            결정 규칙 실험하기 →
          </Link>
        </div>
      </div>
    </div>
  )
}
