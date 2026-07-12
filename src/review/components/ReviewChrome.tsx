import { useEffect, useId, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadSession } from '@/features/meeting-decision/connected-flow/connected-flow.persistence'
import { formatReviewStepLabel } from '@/review/review-steps'
import type { ReviewStep } from '@/review/review.types'
import { navigateReviewSituation } from '@/review/navigate-review-situation'
import {
  resolveCurrentReviewSituation,
  type ReviewSituationId,
} from '@/review/review-situations'
import { DesignNoteDrawer } from './DesignNoteDrawer'
import { SituationPicker } from './SituationPicker'

type ReviewChromeProps = {
  step: ReviewStep
  debugLine?: string
}

export function ReviewChrome({ step, debugLine }: ReviewChromeProps) {
  const [notesOpen, setNotesOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const notesTriggerRef = useRef<HTMLButtonElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const navigate = useNavigate()
  const location = useLocation()
  const currentSituation = resolveCurrentReviewSituation(
    location.pathname,
    loadSession(),
  )

  useEffect(() => {
    setNotesOpen(false)
    setMenuOpen(false)
  }, [step, location.pathname])

  const closeMenu = () => {
    setMenuOpen(false)
    menuTriggerRef.current?.focus()
  }

  const handleSelect = (id: ReviewSituationId) => {
    if (!navigateReviewSituation(id, currentSituation, navigate)) {
      closeMenu()
      return
    }
    setMenuOpen(false)
  }

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
              onClick={() => {
                setMenuOpen(false)
                setNotesOpen(true)
              }}
            >
              설계 근거
            </button>
            <button
              ref={menuTriggerRef}
              type="button"
              className="inline-flex min-h-10 items-center rounded-lg px-3 text-[13px] font-medium text-meeting-text-secondary hover:bg-meeting-panel focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => {
                setNotesOpen(false)
                setMenuOpen((prev) => !prev)
              }}
            >
              상황 선택 ▾
            </button>
          </div>
        </div>
        {debugLine ? (
          <p className="border-t border-dashed border-meeting-divider px-4 py-1 text-center text-[11px] text-meeting-text-tertiary min-[720px]:px-8">
            {debugLine}
          </p>
        ) : null}
      </nav>
      <SituationPicker
        open={menuOpen}
        menuId={menuId}
        triggerRef={menuTriggerRef}
        currentSituation={currentSituation}
        onClose={closeMenu}
        onSelect={handleSelect}
      />
      <DesignNoteDrawer
        open={notesOpen}
        step={step}
        triggerRef={notesTriggerRef}
        onClose={() => setNotesOpen(false)}
      />
    </>
  )
}
