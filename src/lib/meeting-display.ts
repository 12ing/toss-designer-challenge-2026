/**
 * Display sanitizers for meeting title/location so incomplete IME
 * fragments (e.g. "ㅇㄹ", "ㅇ르") never reach the completion screen.
 */

const HANGUL_COMPAT_JAMO = /[\u3131-\u318E]/

export function isIncompleteMeetingText(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return true
  // Compatibility jamo are intermediate IME states, not product copy.
  if (HANGUL_COMPAT_JAMO.test(trimmed)) return true
  return false
}

/** Returns trimmed text, or empty string when the value is empty/garbled. */
export function sanitizeMeetingDisplayText(value: string | undefined): string {
  const trimmed = value?.trim() ?? ''
  if (!trimmed || isIncompleteMeetingText(trimmed)) return ''
  return trimmed
}
