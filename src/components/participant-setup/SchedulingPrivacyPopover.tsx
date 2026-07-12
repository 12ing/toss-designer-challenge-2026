import { useEffect, useId, useRef, useState } from 'react'

type SchedulingPrivacyPopoverProps = {
  /** Compact info-icon trigger next to column header */
  variant?: 'link' | 'icon'
}

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
    hoverTimer.current = window.setTimeout(() => setOpen(true), 180)
  }

  const scheduleClose = () => {
    if (isCoarsePointer()) return
    clearTimers()
    leaveTimer.current = window.setTimeout(() => setOpen(false), 180)
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

  useEffect(() => {
    if (!open || !panelRef.current || !buttonRef.current) return
    const panel = panelRef.current
    const button = buttonRef.current
    const rect = button.getBoundingClientRect()
    const spaceRight = window.innerWidth - rect.left
    const preferLeft = spaceRight < 340

    panel.style.left = preferLeft ? 'auto' : '0'
    panel.style.right = preferLeft ? '0' : 'auto'
    panel.style.maxWidth = `${Math.min(320, window.innerWidth - 24)}px`
  }, [open])

  return (
    <div
      ref={rootRef}
      className="relative inline-flex"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
    >
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
          // Keyboard activation (Enter/Space): keep/open without toggle-close.
          if (event.detail === 0) {
            openPanel()
            return
          }
          setOpen((prev) => !prev)
        }}
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) {
            openPanel()
          }
        }}
        onBlur={(event) => {
          const next = event.relatedTarget as Node | null
          if (rootRef.current?.contains(next)) return
          if (!isCoarsePointer()) {
            scheduleClose()
            return
          }
          closePanel()
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

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="공유된 일정 조건"
          className="absolute top-full z-20 mt-2 w-[min(100vw-1.5rem,320px)] rounded-2xl border border-meeting-divider bg-meeting-surface p-4 shadow-[0_12px_32px_rgba(0,27,55,0.08)]"
          onMouseEnter={openPanel}
          onMouseLeave={scheduleClose}
        >
          <p
            className="mb-2 text-[14px] leading-[21px] text-meeting-text"
            style={{ wordBreak: 'keep-all' }}
          >
            외근이나 선호 시간처럼 회의 조율에 필요한 정보만 보여드려요.
          </p>
          <p
            className="text-[14px] leading-[21px] text-meeting-text-secondary"
            style={{ wordBreak: 'keep-all' }}
          >
            개인 일정의 제목과 사유는 공개되지 않아요.
          </p>
        </div>
      ) : null}
    </div>
  )
}
