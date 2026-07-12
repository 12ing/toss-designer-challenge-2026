import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { formatReviewStepLabel } from '@/review/review-steps'
import type { ReviewStep } from '@/review/review.types'
import { reviewScenariosPath } from '@/review/review-session.factory'
import { DesignNoteDrawer } from './DesignNoteDrawer'

type ReviewChromeProps = {
  step: ReviewStep
  debugLine?: string
}

export function ReviewChrome({ step, debugLine }: ReviewChromeProps) {
  const [notesOpen, setNotesOpen] = useState(false)
  const notesTriggerRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  useEffect(() => {
    setNotesOpen(false)
  }, [step, location.pathname])

  return (
    <>
      <nav
        aria-label="리뷰 내비게이션"
        className="sticky top-0 z-40 border-b border-meeting-divider bg-[rgba(238,240,243,0.92)] backdrop-blur-sm"
      >
        <div className="mx-auto flex h-12 max-w-[944px] items-center justify-between gap-3 px-4 min-[720px]:px-8">
          <p className="truncate text-[13px] font-medium leading-5 text-meeting-text-tertiary">
            {formatReviewStepLabel(step)}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <button
              ref={notesTriggerRef}
              type="button"
              className="inline-flex min-h-10 items-center rounded-lg px-3 text-[13px] font-medium text-meeting-text-secondary hover:bg-meeting-panel focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
              aria-expanded={notesOpen}
              aria-haspopup="dialog"
              onClick={() => setNotesOpen(true)}
            >
              설계 근거
            </button>
            <Link
              to={reviewScenariosPath()}
              className="inline-flex min-h-10 items-center rounded-lg px-3 text-[13px] font-medium text-meeting-text-secondary hover:bg-meeting-panel focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
            >
              상황 선택
            </Link>
          </div>
        </div>
        {debugLine ? (
          <p className="border-t border-dashed border-meeting-divider px-4 py-1 text-center text-[11px] text-meeting-text-tertiary min-[720px]:px-8">
            {debugLine}
          </p>
        ) : null}
      </nav>
      <DesignNoteDrawer
        open={notesOpen}
        step={step}
        triggerRef={notesTriggerRef}
        onClose={() => setNotesOpen(false)}
      />
    </>
  )
}
