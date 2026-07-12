import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { CheckIcon } from '@/components/icons'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import {
  REVIEW_SITUATION_GROUPS,
  type ReviewSituationId,
} from '@/review/review-situations'

type SituationPickerProps = {
  open: boolean
  onClose: () => void
  triggerRef: RefObject<HTMLElement | null>
  currentSituation: ReviewSituationId | null
  onSelect: (id: ReviewSituationId) => void
  menuId: string
}

function useIsDesktopPicker() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 720px)').matches
      : true,
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 720px)')
    const onChange = () => setIsDesktop(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}

function SituationList({
  currentSituation,
  onSelect,
  itemRefs,
}: {
  currentSituation: ReviewSituationId | null
  onSelect: (id: ReviewSituationId) => void
  itemRefs: RefObject<(HTMLButtonElement | null)[]>
}) {
  let itemIndex = 0

  return (
    <div className="flex flex-col" role="none">
      {REVIEW_SITUATION_GROUPS.map((group, groupIndex) => (
        <div
          key={group.id}
          role="group"
          aria-label={group.label}
          className={
            groupIndex > 0
              ? 'mt-3 border-t border-meeting-divider pt-3'
              : undefined
          }
        >
          <p className="mb-1.5 px-3.5 text-[12px] font-semibold tracking-tight text-meeting-text-tertiary">
            {group.label}
          </p>
          <ul className="flex flex-col" role="none">
            {group.items.map((item) => {
              const index = itemIndex
              itemIndex += 1
              const isCurrent = currentSituation === item.id
              return (
                <li key={item.id} role="none">
                  <button
                    ref={(node) => {
                      if (itemRefs.current) itemRefs.current[index] = node
                    }}
                    type="button"
                    role="menuitem"
                    aria-current={isCurrent ? 'true' : undefined}
                    className={[
                      'flex min-h-[52px] w-full items-start gap-2.5 rounded-xl px-3.5 py-3 text-left',
                      'hover:bg-meeting-panel',
                      'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]',
                      isCurrent ? 'bg-meeting-panel/70' : '',
                    ].join(' ')}
                    onClick={() => onSelect(item.id)}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="text-[14px] font-medium leading-5 text-meeting-text">
                          {item.title}
                        </span>
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-0.5 text-[12px] font-medium text-meeting-text-secondary">
                            <CheckIcon className="h-3.5 w-3.5" />
                            현재
                          </span>
                        ) : null}
                      </span>
                      <span
                        className="mt-1 block text-[12px] leading-[18px] text-meeting-text-tertiary"
                        style={{ wordBreak: 'keep-all' }}
                      >
                        {item.description}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function SituationPicker({
  open,
  onClose,
  triggerRef,
  currentSituation,
  onSelect,
  menuId,
}: SituationPickerProps) {
  const isDesktop = useIsDesktopPicker()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  useFocusTrap(
    open && !isDesktop,
    panelRef,
    triggerRef,
    closeBtnRef,
  )

  useLayoutEffect(() => {
    if (!open || !isDesktop) return
    const panel = panelRef.current
    const trigger = triggerRef.current
    if (!panel || !trigger) return

    const place = () => {
      const rect = trigger.getBoundingClientRect()
      const width = 340
      const gap = 8
      let left = rect.right - width
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8))
      const top = rect.bottom + gap
      const maxHeight = Math.max(160, window.innerHeight - top - 16)
      panel.style.position = 'fixed'
      panel.style.top = `${top}px`
      panel.style.left = `${left}px`
      panel.style.width = `${width}px`
      panel.style.maxHeight = `${maxHeight}px`
    }

    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, isDesktop, triggerRef])

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        triggerRef.current?.focus()
        return
      }

      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

      const buttons = itemRefs.current.filter(Boolean) as HTMLButtonElement[]
      if (buttons.length === 0) return

      const activeIndex = buttons.findIndex((el) => el === document.activeElement)
      event.preventDefault()

      if (event.key === 'ArrowDown') {
        const next =
          activeIndex < 0 ? 0 : (activeIndex + 1) % buttons.length
        buttons[next]?.focus()
        return
      }

      const prev =
        activeIndex <= 0 ? buttons.length - 1 : activeIndex - 1
      buttons[prev]?.focus()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, triggerRef])

  useEffect(() => {
    if (!open || !isDesktop) return

    const onPointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return
      }
      onClose()
    }

    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
    }
  }, [open, isDesktop, onClose, triggerRef])

  useEffect(() => {
    if (!open || isDesktop) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open, isDesktop])

  useEffect(() => {
    if (!open || !isDesktop) return
    const first = itemRefs.current.find(Boolean)
    first?.focus()
  }, [open, isDesktop])

  if (!open || typeof document === 'undefined') return null

  const list = (
    <SituationList
      currentSituation={currentSituation}
      itemRefs={itemRefs}
      onSelect={(id) => {
        onSelect(id)
      }}
    />
  )

  if (isDesktop) {
    return createPortal(
      <div
        ref={panelRef}
        id={menuId}
        role="menu"
        aria-label="상황 선택"
        className="z-[60] overflow-y-auto rounded-2xl border border-meeting-divider bg-white p-2 shadow-[0_8px_28px_rgba(0,27,55,0.12)]"
      >
        <p className="px-3.5 pb-2 pt-2 text-[13px] font-semibold text-meeting-text">
          상황 선택
        </p>
        {list}
      </div>,
      document.body,
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(0,27,55,0.28)]"
        aria-label="상황 선택 닫기"
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        id={menuId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[75vh] w-full flex-col rounded-t-3xl border border-meeting-divider border-b-0 bg-white shadow-[0_-8px_32px_rgba(0,27,55,0.12)]"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex shrink-0 flex-col items-center px-4 pt-2">
          <div
            className="mb-2 h-1 w-10 rounded-full bg-meeting-divider"
            aria-hidden
          />
          <div className="flex w-full items-center justify-between pb-2">
            <h2
              id={titleId}
              className="text-[16px] font-semibold text-meeting-text"
            >
              상황 선택
            </h2>
            <button
              ref={closeBtnRef}
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[14px] font-medium text-meeting-text-secondary hover:bg-meeting-panel focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </div>
        <div
          className="min-h-0 flex-1 overflow-y-auto px-2 pb-2"
          role="menu"
          aria-label="상황 선택"
        >
          {list}
        </div>
      </div>
    </div>,
    document.body,
  )
}
