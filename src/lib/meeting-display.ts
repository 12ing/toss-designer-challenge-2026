/** Meeting title: non-empty after trim. No format / jamo quality checks. */
export function normalizeMeetingTitle(title: string | undefined): string {
  return (title ?? '').trim()
}

export function isMeetingTitleValid(title: string | undefined): boolean {
  return normalizeMeetingTitle(title).length > 0
}

/** Location stored trimmed; empty allowed. */
export function normalizeMeetingLocation(location: string | undefined): string {
  return (location ?? '').trim()
}
