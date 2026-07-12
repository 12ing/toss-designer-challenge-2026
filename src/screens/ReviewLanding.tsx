import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { LiveProductPreview } from '@/review/components/LiveProductPreview'
import { OmittedScopeSection } from '@/review/components/OmittedScopeSection'
import { trackReviewEvent } from '@/review/review-analytics'
import {
  organizerPath,
  startCoreReviewSession,
} from '@/review/review-session.factory'

export function ReviewLanding() {
  const navigate = useNavigate()

  useEffect(() => {
    trackReviewEvent('review_landing_viewed')
  }, [])

  const startCoreFlow = () => {
    const session = startCoreReviewSession()
    navigate(organizerPath(session.id))
  }

  return (
    <div className="min-h-screen bg-meeting-bg">
      <div className="mx-auto grid min-h-screen w-full max-w-[1120px] grid-cols-1 gap-12 px-8 py-16 max-[899px]:gap-10 max-[899px]:px-5 max-[899px]:py-12 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] min-[900px]:items-center min-[900px]:gap-16">
        <div className="min-w-0">
          <p className="mb-4 text-[13px] font-medium leading-5 tracking-wide text-meeting-text-tertiary">
            Toss Product Designer Challenge 2026
          </p>

          <h1
            className="mb-5 text-[32px] font-bold leading-[42px] tracking-tight text-meeting-text max-[899px]:text-[28px] max-[899px]:leading-[38px]"
            style={{ wordBreak: 'keep-all' }}
          >
            6명의 일정을 비교하지 않고,
            <br />
            가장 적은 조율로 회의를 확정합니다.
          </h1>

          <p
            className="mb-4 text-[16px] leading-6 text-meeting-text-secondary"
            style={{ wordBreak: 'keep-all' }}
          >
            주최자는 빈 시간을 찾는 것보다,
            <br />
            필수 참석·외근·개인 선호가 충돌할 때
            <br />
            무엇을 우선해야 할지 판단하기 어렵습니다.
          </p>

          <p
            className="mb-5 text-[16px] leading-6 text-meeting-text"
            style={{ wordBreak: 'keep-all' }}
          >
            여섯 개의 캘린더 대신
            <br />
            한 시간과 6명에게 미치는 영향,
            <br />
            그리고 필요한 다음 행동을 제안했습니다.
          </p>

          <p className="mb-8 text-[14px] leading-[21px] text-meeting-text-secondary">
            참석 조건 → 시간 제안 → 확인 요청 → 참석자 응답 → 확정
          </p>

          <div className="mb-8 max-w-[360px]">
            <Button onClick={startCoreFlow}>핵심 플로우 시작</Button>
            <p className="mt-3 text-[13px] leading-5 text-meeting-text-tertiary">
              약 2분 · 공통 시간이 없는 상황부터 시작해요
            </p>
            <Link
              to="/lab"
              className="mt-4 inline-flex min-h-11 items-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
              onClick={() => trackReviewEvent('rule_lab_opened')}
            >
              조건을 직접 바꿔보기
            </Link>
          </div>

          <div className="max-w-[420px]">
            <OmittedScopeSection />
          </div>
        </div>

        <div className="min-w-0 max-[899px]:order-last">
          <LiveProductPreview />
        </div>
      </div>
    </div>
  )
}
