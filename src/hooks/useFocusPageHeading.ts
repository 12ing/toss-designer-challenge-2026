import { useEffect, useRef } from 'react'

/**
 * Move keyboard focus to the main page heading when the step/route changes.
 * Headings receive tabIndex=-1 so they can be focused without entering tab order.
 */
export function useFocusPageHeading(dependencyKey: string | number) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const heading =
      headingRef.current ??
      document.querySelector<HTMLElement>(
        'main h1, main h2, [data-page-heading]',
      )
    if (!heading) return
    if (!heading.hasAttribute('tabindex')) {
      heading.tabIndex = -1
    }
    heading.focus({ preventScroll: true })
  }, [dependencyKey])

  return headingRef
}
