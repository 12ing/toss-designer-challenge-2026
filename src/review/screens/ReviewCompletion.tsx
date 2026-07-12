import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { reviewCopy } from '@/copy/review.copy'
import { clearSession } from '@/features/meeting-decision/connected-flow/connected-flow.persistence'
import { navigateReviewSituation } from '@/review/navigate-review-situation'
import { trackReviewEvent } from '@/review/review-analytics'
import {
  isReviewMode,
  isUserTestMode,
  withReviewQuery,
} from '@/review/review-mode'
import {
  REVIEW_COMPLETION_SCENARIOS,
  setReviewSituationHint,
  type ReviewSituationId,
} from '@/review/review-situations'

type CompletionView = 'summary' | 'scenario-picker'

function ChevronIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className="mt-0.5 h-5 w-5 shrink-0 text-meeting-text-tertiary"
    >
      <path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ReviewCompletion() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const [view, setView] = useState<CompletionView>('summary')
  const exploreButtonRef = useRef<HTMLButtonElement>(null)
  const pickerHeadingRef = useRef<HTMLHeadingElement>(null)
  const copy = reviewCopy.completion
  const [titleLine1, titleLine2] = copy.title.split('\n')
  const bodyLines = copy.body.split('\n')
  const pickerDescriptionLines = copy.pickerDescription.split('\n')

  useEffect(() => {
    trackReviewEvent('core_flow_completed', { sessionId })
  }, [sessionId])

  useEffect(() => {
    if (view !== 'scenario-picker') return
    const heading = pickerHeadingRef.current
    if (!heading) return
    heading.focus()
    const rect = heading.getBoundingClientRect()
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      heading.scrollIntoView({ block: 'nearest' })
    }
  }, [view])

  if (isUserTestMode(searchParams) || !isReviewMode(searchParams)) {
    return <Navigate to="/" replace />
  }

  const openPicker = () => setView('scenario-picker')

  const backToSummary = () => {
    setView('summary')
    window.requestAnimationFrame(() => {
      exploreButtonRef.current?.focus()
    })
  }

  const selectScenario = (id: ReviewSituationId) => {
    navigateReviewSituation(id, null, navigate)
  }

  const panelClass =
    'motion-safe:animate-[completion-view-in_160ms_ease] motion-reduce:animate-none'

  return (
    <div className="flex min-h-[100dvh] flex-col bg-meeting-bg pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center px-5 py-10 min-[720px]:px-8 min-[720px]:pb-24 min-[720px]:pt-16">
        {view === 'summary' ? (
          <div key="summary" className={panelClass}>
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
                ref={exploreButtonRef}
                type="button"
                className="w-full"
                onClick={openPicker}
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
        ) : (
          <div key="scenario-picker" className={panelClass}>
            <p className="mb-4 text-[13px] font-medium leading-5 text-meeting-text-tertiary">
              {copy.pickerEyebrow}
            </p>
            <h1
              ref={pickerHeadingRef}
              tabIndex={-1}
              className="mb-3 text-[26px] font-bold leading-[36px] text-meeting-text outline-none focus:outline-none focus-visible:outline-none min-[720px]:text-[28px] min-[720px]:leading-[38px]"
              style={{ wordBreak: 'keep-all' }}
            >
              {copy.pickerTitle}
            </h1>
            <p
              className="mb-8 text-[15px] leading-[23px] text-meeting-text-secondary min-[720px]:mb-9 min-[720px]:text-[16px] min-[720px]:leading-6"
              style={{ wordBreak: 'keep-all' }}
            >
              {pickerDescriptionLines.map((line, i) => (
                <span key={line}>
                  {line}
                  {i < pickerDescriptionLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>

            <ul className="flex flex-col gap-3">
              {REVIEW_COMPLETION_SCENARIOS.map((scenario) => (
                <li key={scenario.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 rounded-2xl border border-meeting-divider bg-meeting-surface px-5 py-[18px] text-left transition-colors hover:bg-meeting-panel focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
                    onClick={() => selectScenario(scenario.id)}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-semibold leading-6 text-meeting-text">
                        {scenario.title}
                      </span>
                      <span
                        className="mt-1 block text-[13px] leading-5 text-meeting-text-tertiary"
                        style={{ wordBreak: 'keep-all' }}
                      >
                        {scenario.description}
                      </span>
                    </span>
                    <ChevronIcon />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col items-start gap-3">
              <button
                type="button"
                className="inline-flex min-h-11 items-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
                onClick={backToSummary}
              >
                {copy.backToSummary}
              </button>
              <Link
                to={withReviewQuery('/')}
                className="inline-flex min-h-11 items-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
                onClick={() => {
                  clearSession()
                  setReviewSituationHint('landing')
                }}
              >
                {reviewCopy.scenarios.backToIntro}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
