import { useEffect, useId, useRef } from 'react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { PRODUCT_PHILOSOPHY, reviewNotesByStep } from '@/review/review-notes'
import type { ReviewStep } from '@/review/review.types'
import { trackReviewEvent } from '@/review/review-analytics'

type DesignNoteDrawerProps = {
  open: boolean
  step: ReviewStep
  onClose: () => void
  triggerRef?: React.RefObject<HTMLElement | null>
}

export function DesignNoteDrawer({
  open,
  step,
  onClose,
  triggerRef,
}: DesignNoteDrawerProps) {
  const titleId = useId()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const note = reviewNotesByStep[step]

  useFocusTrap(open, panelRef, triggerRef, titleRef)

  useEffect(() => {
    if (!open) return
    trackReviewEvent('design_note_opened', { step })
  }, [open, step])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end max-[719px]:items-end">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(0,27,55,0.28)]"
        aria-label="설계 근거 닫기"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex h-full w-full max-w-[360px] flex-col bg-meeting-surface shadow-[-8px_0_32px_rgba(0,27,55,0.12)] max-[719px]:h-auto max-[719px]:max-h-[85vh] max-[719px]:max-w-none max-[719px]:rounded-t-3xl max-[719px]:shadow-[0_-8px_32px_rgba(0,27,55,0.12)]"
      >
        <div className="flex items-center justify-between border-b border-meeting-divider px-5 py-4">
          <div>
            <p className="text-[12px] font-medium text-meeting-text-tertiary">
              현재 단계
            </p>
            <h2
              ref={titleRef}
              id={titleId}
              tabIndex={-1}
              className="text-[16px] font-semibold text-meeting-text outline-none"
            >
              {note.title}
            </h2>
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[14px] font-medium text-meeting-text-secondary hover:bg-meeting-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
          <section>
            <h3 className="mb-2 text-[13px] font-semibold text-meeting-text-secondary">
              제품 철학
            </h3>
            <p
              className="text-[15px] leading-[23px] text-meeting-text"
              style={{ wordBreak: 'keep-all' }}
            >
              {PRODUCT_PHILOSOPHY}
            </p>
          </section>
          <section>
            <h3 className="mb-2 text-[13px] font-semibold text-meeting-text-secondary">
              설계한 문제
            </h3>
            <p
              className="text-[15px] leading-[23px] text-meeting-text"
              style={{ wordBreak: 'keep-all' }}
            >
              {note.problem}
            </p>
          </section>
          <section>
            <h3 className="mb-2 text-[13px] font-semibold text-meeting-text-secondary">
              적용한 규칙
            </h3>
            <p
              className="text-[15px] leading-[23px] text-meeting-text"
              style={{ wordBreak: 'keep-all' }}
            >
              {note.rule}
            </p>
          </section>
          <section>
            <h3 className="mb-2 text-[13px] font-semibold text-meeting-text-secondary">
              의도적으로 만들지 않은 것
            </h3>
            <p
              className="text-[15px] leading-[23px] text-meeting-text"
              style={{ wordBreak: 'keep-all' }}
            >
              {note.omitted}
            </p>
          </section>
        </div>
      </aside>
    </div>
  )
}
