import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { OmittedScopeSection } from '@/review/components/OmittedScopeSection'
import { trackReviewEvent } from '@/review/review-analytics'
import {
  organizerPath,
  startDeclineBranchSession,
  startReadyReviewSession,
} from '@/review/review-session.factory'

export function ReviewCompletion() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    trackReviewEvent('core_flow_completed', { sessionId })
  }, [sessionId])

  return (
    <div className="min-h-screen bg-meeting-bg">
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col justify-center px-8 py-16">
        <p className="mb-3 text-[13px] font-medium text-meeting-text-tertiary">
          핵심 플로우 완료
        </p>
        <h1
          className="mb-4 text-[28px] font-bold leading-[38px] text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          공통 시간이 없어도
          <br />
          확인과 응답을 연결해 회의 시간을 확정했어요.
        </h1>
        <p
          className="mb-10 text-[16px] leading-6 text-meeting-text-secondary"
          style={{ wordBreak: 'keep-all' }}
        >
          필수 참석 조건을 먼저 지키고,
          <br />
          이동 가능한 일정만 당사자에게 확인한 뒤,
          <br />
          응답 결과를 같은 규칙으로 다시 계산했습니다.
        </p>

        <div className="mb-10 flex flex-col gap-3">
          <Button
            onClick={() => {
              const session = startDeclineBranchSession()
              navigate(organizerPath(session.id))
            }}
          >
            거절 후 재추천 보기
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const session = startReadyReviewSession()
              navigate(organizerPath(session.id))
            }}
          >
            바로 확정 가능한 경우 보기
          </Button>
          <Link
            to="/lab"
            className="inline-flex min-h-11 items-center justify-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
          >
            결정 규칙 실험하기
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
          >
            처음으로
          </Link>
        </div>

        <OmittedScopeSection />
      </div>
    </div>
  )
}
