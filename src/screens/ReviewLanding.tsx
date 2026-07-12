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
    <div className="min-h-screen overflow-x-hidden bg-meeting-bg">
      <div className="@container/hero mx-auto w-full max-w-[1200px] px-5 py-12 min-[640px]:px-8 min-[640px]:py-16">
        <div className="grid min-w-0 grid-cols-1 gap-10 @[1000px]/hero:grid-cols-[minmax(0,1fr)_minmax(0,560px)] @[1000px]/hero:items-start @[1000px]/hero:gap-12">
          <div className="min-w-0">
            <p className="mb-4 text-[13px] font-medium leading-5 tracking-wide text-meeting-text-tertiary">
              Toss Product Designer Challenge 2026
            </p>

            <h1
              className="mb-5 text-[clamp(1.5rem,4.5vw,2rem)] font-bold leading-[1.35] tracking-tight text-meeting-text"
              style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
            >
              6명의 일정을 직접 비교하지 않아도,
              <br />
              현재 조건에서 조율이 가장 적은 시간을 찾습니다.
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

            <p
              className="mb-8 text-[14px] leading-[21px] text-meeting-text-secondary"
              style={{ wordBreak: 'keep-all' }}
            >
              참석 조건 → 시간 제안 → 확인 요청 → 참석자 응답 → 확정
            </p>

            <div className="mb-8 w-full min-w-0 max-w-md">
              <Button onClick={startCoreFlow} className="whitespace-nowrap">
                핵심 플로우 시작
              </Button>
              <p
                className="mt-3 text-[13px] leading-5 text-meeting-text-tertiary"
                style={{ wordBreak: 'keep-all' }}
              >
                약 2분 · 공통 시간이 없는 상황부터 시작해요
              </p>
              <Link
                to="/lab"
                className="mt-4 inline-flex min-h-11 max-w-full items-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
                style={{ wordBreak: 'keep-all' }}
                onClick={() => trackReviewEvent('rule_lab_opened')}
              >
                결정 규칙 실험하기
              </Link>
              <p
                className="mt-2 text-[13px] leading-5 text-meeting-text-tertiary"
                style={{ wordBreak: 'keep-all' }}
              >
                필수·선택 조건에 따라 같은 엔진이 결과를 어떻게 다시 계산하는지
                확인해보세요.
              </p>
            </div>

            <div className="max-w-md">
              <OmittedScopeSection />
            </div>
          </div>

          <div className="min-w-0 w-full">
            <LiveProductPreview />
          </div>
        </div>
      </div>
    </div>
  )
}
