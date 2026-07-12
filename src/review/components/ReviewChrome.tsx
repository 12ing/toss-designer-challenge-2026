import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatReviewStepLabel } from '@/review/review-steps'
import type { ReviewStep } from '@/review/review.types'
import { DesignNoteDrawer } from './DesignNoteDrawer'
import { ReviewMenu } from './ReviewMenu'

type ReviewChromeProps = {
  step: ReviewStep
  debugLine?: string
}

export function ReviewChrome({ step, debugLine }: ReviewChromeProps) {
  const [notesOpen, setNotesOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setNotesOpen(false)
  }, [step])

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
              type="button"
              className="inline-flex min-h-10 items-center rounded-lg px-3 text-[13px] font-medium text-meeting-text-secondary hover:bg-meeting-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
              onClick={() => setNotesOpen(true)}
            >
              설계 의도
            </button>
            <button
              type="button"
              className="inline-flex min-h-10 items-center rounded-lg px-3 text-[13px] font-medium text-meeting-text-secondary hover:bg-meeting-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              다른 장면
            </button>
            <Link
              to="/"
              className="inline-flex min-h-10 items-center rounded-lg px-3 text-[13px] font-medium text-meeting-text-secondary hover:bg-meeting-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
            >
              처음으로
            </Link>
          </div>
        </div>
        {menuOpen ? (
          <div className="border-t border-meeting-divider bg-meeting-bg">
            <div className="mx-auto max-w-[944px] px-4 py-3 min-[720px]:px-8">
              <ReviewMenu onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        ) : null}
        {debugLine ? (
          <p className="border-t border-dashed border-meeting-divider px-4 py-1 text-center text-[11px] text-meeting-text-tertiary min-[720px]:px-8">
            {debugLine}
          </p>
        ) : null}
      </nav>
      <DesignNoteDrawer
        open={notesOpen}
        step={step}
        onClose={() => setNotesOpen(false)}
      />
    </>
  )
}
