import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PAGE_DESCRIPTION, PAGE_TITLE } from '@/copy/product.copy'
import { reviewCopy } from '@/copy/review.copy'
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
  const { landing } = reviewCopy

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

  const [titleLine1, titleLine2] = landing.title.split('\n')
  const [bodyLine1, bodyLine2] = landing.body.split('\n')

  return (
    <div className="min-h-screen overflow-x-hidden bg-meeting-bg">
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col justify-center px-5 py-12 pt-[max(3rem,8vh)] min-[640px]:px-8">
        <main className="w-full max-w-[520px]">
          <p className="mb-4 text-[13px] font-medium leading-5 tracking-wide text-meeting-text-tertiary">
            {landing.eyebrow}
          </p>

          <h1
            ref={headingRef}
            data-page-heading
            className="mb-7 text-[clamp(1.5rem,4.5vw,2rem)] font-bold leading-[1.35] tracking-tight text-meeting-text"
            style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
          >
            {titleLine1}
            <br />
            {titleLine2}
          </h1>

          <p
            className="mb-9 text-[16px] font-normal leading-6 text-meeting-text-secondary"
            style={{ wordBreak: 'keep-all' }}
          >
            {bodyLine1}
            <br />
            {bodyLine2}
          </p>

          <div className="w-full min-w-0 max-w-md">
            <Button onClick={startCoreFlow}>{landing.primaryAction}</Button>
            <p
              className="mt-2.5 text-[13px] leading-5 text-meeting-text-tertiary"
              style={{ wordBreak: 'keep-all' }}
            >
              {landing.helper}
            </p>
            {!hideLab ? (
              <Link
                to="/lab"
                className="mt-8 inline-flex min-h-11 items-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
                style={{ wordBreak: 'keep-all' }}
                onClick={() => trackReviewEvent('rule_lab_opened')}
              >
                {landing.labLink}
              </Link>
            ) : null}
          </div>
          <p className="sr-only">{PAGE_DESCRIPTION}</p>
        </main>
      </div>
    </div>
  )
}
