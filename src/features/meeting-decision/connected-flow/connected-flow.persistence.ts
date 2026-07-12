import type { MeetingDecisionSession } from './connected-flow.types'
import { SESSION_STORAGE_KEY } from './connected-flow.types'

export function loadSession(): MeetingDecisionSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as MeetingDecisionSession
  } catch {
    return null
  }
}

export function saveSession(session: MeetingDecisionSession): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // ignore quota / private mode
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function findSessionByRequestId(
  requestId: string,
): MeetingDecisionSession | null {
  const session = loadSession()
  if (!session?.activeRequest) return null
  if (session.activeRequest.id !== requestId) return null
  return session
}
