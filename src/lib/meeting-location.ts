/**
 * Treats values that look like web meeting links as URLs.
 * Place names like "4층 A" must not match.
 */
export function isMeetingLocationUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (/\s/.test(trimmed)) return false

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    // Require a dotted host so bare words are not treated as links.
    return url.hostname.includes('.')
  } catch {
    return false
  }
}

export function toMeetingLocationHref(value: string): string {
  const trimmed = value.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}
