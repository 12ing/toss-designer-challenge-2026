import { useEffect } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { reviewCopy } from '@/copy/review.copy'
import { clearSession } from '@/features/meeting-decision/connected-flow/connected-flow.persistence'
import { trackReviewEvent } from '@/review/review-analytics'
import {
  isReviewMode,
  isUserTestMode,
  withReviewQuery,
} from '@/review/review-mode'
import { setReviewSituationHint } from '@/review/review-situations'
import { reviewScenariosPath } from '@/review/review-session.factory'

export function ReviewCompletion() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const copy = reviewCopy.completion
  const [titleLine1, titleLine2] = copy.title.split('\n')
  const bodyLines = copy.body.split('\n')

  useEffect(() => {
    trackReviewEvent('core_flow_completed', { sessionId })
  }, [sessionId])

  if (isUserTestMode(searchParams) || !isReviewMode(searchParams)) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-meeting-bg">
      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center px-5 py-10 min-[720px]:px-8 min-[720px]:pb-24 min-[720px]:pt-16">
        <p className="mb-4 text-[13px] font-medium leading-5 text-meeting-text-tertiary">
          {copy.eyebrow}
        </p>
        <h1
          className="mb-6 text-[26px] font-bold leading-[36px] text-meeting-text outline-none focus:outline-none focus-visible:outline-none min-[720px]:text-[28px] min-[720px]:leading-[38px]"
          style={{ wordBreak: 'keep-all' }}
        >
          {titleLine1}
          <br />
          {titleLine2}
        </h1>
        <p
          className="mb-9 text-[15px] leading-[23px] text-meeting-text-secondary min-[720px]:mb-10 min-[720px]:text-[16px] min-[720px]:leading-6"
          style={{ wordBreak: 'keep-all' }}
        >
          {bodyLines.map((line, i) => (
            <span key={line}>
              {line}
              {i < bodyLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>

        <div className="flex flex-col items-stretch gap-4 min-[720px]:items-start">
          <Button
            type="button"
            className="w-full"
            onClick={() => navigate(reviewScenariosPath())}
          >
            {copy.primaryAction}
          </Button>
          <Link
            to={withReviewQuery('/')}
            className="inline-flex min-h-11 items-center justify-center self-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)] min-[720px]:self-start"
            onClick={() => {
              clearSession()
              setReviewSituationHint('landing')
            }}
          >
            {copy.secondaryAction}
          </Link>
        </div>
      </div>
    </div>
  )
}
