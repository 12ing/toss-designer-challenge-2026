import { isReviewMode, isUserTestMode } from '@/review/review-mode'

export const SHOW_PROTOTYPE_CONTROLS_DEFAULT = false

/**
 * Review chrome / actor transitions / design notes.
 * Visible only with `?review=1` and never with `?usertest=1`.
 */
export function shouldShowPrototypeControls() {
  if (typeof window === 'undefined') return SHOW_PROTOTYPE_CONTROLS_DEFAULT
  if (isUserTestMode()) return false
  if (isReviewMode()) return true
  // Legacy: explicit prototype=1 still shows controls for local QA
  const params = new URLSearchParams(window.location.search)
  if (params.get('prototype') === '1') return true
  if (params.get('prototype') === '0') return false
  return SHOW_PROTOTYPE_CONTROLS_DEFAULT
}
