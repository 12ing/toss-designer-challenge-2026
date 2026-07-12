import { useEffect, useId, useRef, useState } from 'react'

type SchedulingPrivacyPopoverProps = {
  /** Compact info-icon trigger next to column header */
  variant?: 'link' | 'icon'
}

const PRIVACY_COPY =
  '외근이나 선호 시간처럼 조율에 필요한 정보만 보여줘요. 일정 제목과 사유는 공유하지 않아요.'

function isCoarsePointer() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: none), (pointer: coarse)').matches
}

export function SchedulingPrivacyPopover({
  variant = 'icon',
}: SchedulingPrivacyPopoverProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<number | null>(null)
  const leaveTimer = useRef<number | null>(null)
  const coarse = typeof window !== 'undefined' && isCoarsePointer()

  const clearTimers = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current)
    hoverTimer.current = null
    leaveTimer.current = null
  }

  const openPanel = () => {
    clearTimers()
    setOpen(true)
  }

  const closePanel = () => {
    clearTimers()
    setOpen(false)
  }

  const scheduleOpen = () => {
    if (isCoarsePointer()) return
    clearTimers()
    hoverTimer.current = window.setTimeout(() => setOpen(true), 150)
  }

  const scheduleClose = () => {
    if (isCoarsePointer()) return
    clearTimers()
    leaveTimer.current = window.setTimeout(() => setOpen(false), 150)
  }

  useEffect(() => () => clearTimers(), [])

  useEffect(() => {
    if (!open) return

    const onPointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const trigger = (
    <button
      ref={buttonRef}
      type="button"
      className={
        variant === 'icon'
          ? 'inline-flex size-7 items-center justify-center rounded-full text-meeting-text-secondary hover:bg-meeting-panel hover:text-meeting-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]'
          : 'min-h-11 text-[13px] font-medium text-meeting-text-secondary underline underline-offset-2 hover:text-meeting-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]'
      }
      aria-expanded={open}
      aria-controls={panelId}
      aria-describedby={open ? panelId : undefined}
      aria-label="일정 조건 안내"
      onClick={(event) => {
        if (event.detail === 0) {
          openPanel()
          return
        }
        setOpen((prev) => !prev)
      }}
      onFocus={(event) => {
        if (isCoarsePointer()) return
        if (event.currentTarget.matches(':focus-visible')) {
          openPanel()
        }
      }}
      onBlur={(event) => {
        if (isCoarsePointer()) return
        const next = event.relatedTarget as Node | null
        if (rootRef.current?.contains(next)) return
        scheduleClose()
      }}
    >
      {variant === 'icon' ? (
        <span
          aria-hidden
          className="flex size-[18px] items-center justify-center rounded-full border border-current text-[11px] font-semibold leading-none"
        >
          i
        </span>
      ) : (
        '공유된 일정 조건'
      )}
    </button>
  )

  return (
    <div
      ref={rootRef}
      className="relative inline-flex"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
    >
      {trigger}

      {open && !coarse ? (
        <div
          ref={panelRef}
          id={panelId}
          role="tooltip"
          className="absolute top-full z-20 mt-2 w-[min(100vw-1.5rem,250px)] rounded-xl border border-meeting-divider bg-meeting-surface px-3.5 py-3 shadow-[0_12px_32px_rgba(0,27,55,0.08)]"
          onMouseEnter={openPanel}
          onMouseLeave={scheduleClose}
        >
          <p
            className="text-[13px] leading-5 text-meeting-text-secondary"
            style={{ wordBreak: 'keep-all' }}
          >
            {PRIVACY_COPY}
          </p>
        </div>
      ) : null}

      {open && coarse ? (
        <div className="fixed inset-0 z-50 flex items-end">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(0,27,55,0.28)]"
            aria-label="닫기"
            onClick={closePanel}
          />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="일정 조건 안내"
            className="relative z-10 w-full rounded-t-2xl border border-meeting-divider bg-meeting-surface px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-8px_24px_rgba(0,27,55,0.1)]"
          >
            <p
              className="mb-4 text-[15px] leading-[23px] text-meeting-text"
              style={{ wordBreak: 'keep-all' }}
            >
              {PRIVACY_COPY}
            </p>
            <button
              type="button"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--meeting-radius-button)] border border-meeting-divider bg-meeting-surface text-[15px] font-semibold text-meeting-text"
              onClick={() => {
                closePanel()
                buttonRef.current?.focus()
              }}
            >
              확인
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
