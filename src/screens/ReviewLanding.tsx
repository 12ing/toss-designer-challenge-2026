import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PAGE_DESCRIPTION, PAGE_TITLE } from '@/copy/product.copy'
import { clearSession } from '@/features/meeting-decision/connected-flow/connected-flow.persistence'
import { useFocusPageHeading } from '@/hooks/useFocusPageHeading'
import { trackReviewEvent } from '@/review/review-analytics'
import { isUserTestMode } from '@/review/review-mode'
import {
  organizerPath,
  startCoreReviewSession,
} from '@/review/review-session.factory'

export function ReviewLanding() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hideLab = isUserTestMode(searchParams)
  const headingRef = useFocusPageHeading('landing')

  useEffect(() => {
    // Submission base URL always starts clean — do not restore a stale session.
    clearSession()
    trackReviewEvent('review_landing_viewed')
    document.title = PAGE_TITLE
  }, [])

  const startCoreFlow = () => {
    const session = startCoreReviewSession()
    // Preserve usertest isolation; otherwise start in review mode for submission.
    const forceReview = !isUserTestMode(searchParams)
    navigate(organizerPath(session.id, forceReview), { replace: true })
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-meeting-bg">
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col justify-center px-5 py-12 pt-[max(3rem,8vh)] min-[640px]:px-8">
        <main className="w-full max-w-[520px]">
          <p className="mb-4 text-[13px] font-medium leading-5 tracking-wide text-meeting-text-tertiary">
            Toss Product Designer Challenge 2026
          </p>

          <h1
            ref={headingRef}
            data-page-heading
            className="mb-7 text-[clamp(1.5rem,4.5vw,2rem)] font-bold leading-[1.35] tracking-tight text-meeting-text"
            style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
          >
            회의 시간은 모두가 비는 순간이 아니라,
            <br />
            무엇을 먼저 지킬지 정할 때 확정됩니다.
          </h1>

          <p
            className="mb-9 text-[16px] font-normal leading-6 text-meeting-text-secondary"
            style={{ wordBreak: 'keep-all' }}
          >
            필수 참석은 지키고, 외근과 개인 완충는 필요한 만큼 반영해
            <br />
            지금 확정할 수 있는 한 시간과 필요한 다음 행동을 제안했습니다.
          </p>

          <div className="w-full min-w-0 max-w-md">
            <Button onClick={startCoreFlow}>핵심 플로우 시작</Button>
            <p
              className="mt-2.5 text-[13px] leading-5 text-meeting-text-tertiary"
              style={{ wordBreak: 'keep-all' }}
            >
              약 2분 · 공통 시간이 없는 상황부터 시작해요
            </p>
            {!hideLab ? (
              <Link
                to="/lab"
                className="mt-8 inline-flex min-h-11 items-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
                style={{ wordBreak: 'keep-all' }}
                onClick={() => trackReviewEvent('rule_lab_opened')}
              >
                결정 규칙 실험하기 →
              </Link>
            ) : null}
          </div>
          <p className="sr-only">{PAGE_DESCRIPTION}</p>
        </main>
      </div>
    </div>
  )
}
