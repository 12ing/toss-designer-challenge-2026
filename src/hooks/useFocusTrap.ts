import { useEffect, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/** Trap Tab focus inside a container while open; restore trigger on close. */
export function useFocusTrap(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  triggerRef?: RefObject<HTMLElement | null>,
  initialFocusRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return
    const container = containerRef.current
    if (!container) return

    const previouslyFocused =
      (document.activeElement as HTMLElement | null) ?? null
    const trigger = triggerRef?.current ?? null

    const focusInitial = () => {
      const initial =
        initialFocusRef?.current ??
        container.querySelector<HTMLElement>(FOCUSABLE)
      initial?.focus()
    }
    focusInitial()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const nodes = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault()
          last.focus()
        }
        return
      }
      if (active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', onKeyDown)
    return () => {
      container.removeEventListener('keydown', onKeyDown)
      const restore = trigger ?? previouslyFocused
      restore?.focus()
    }
  }, [open, containerRef, triggerRef, initialFocusRef])
}
