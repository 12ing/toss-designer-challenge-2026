import {
  createSession,
  createSessionFromAttendance,
} from '@/features/meeting-decision/connected-flow/connected-flow.actions'
import {
  clearSession,
  saveSession,
} from '@/features/meeting-decision/connected-flow/connected-flow.persistence'
import type { MeetingDecisionSession } from '@/features/meeting-decision/connected-flow/connected-flow.types'
import type { AttendanceType } from '@/features/meeting-decision/engine/decision-engine.types'
import { preserveModeQuery, withReviewQuery } from './review-mode'
import { trackReviewEvent } from './review-analytics'

function persistFresh(session: MeetingDecisionSession): MeetingDecisionSession {
  clearSession()
  saveSession(session)
  return session
}

export function startCoreReviewSession(): MeetingDecisionSession {
  const session = persistFresh(createSession('coordination'))
  trackReviewEvent('core_flow_started', { sessionId: session.id })
  return session
}

export function startReadyReviewSession(): MeetingDecisionSession {
  const session = persistFresh(createSession('ready'))
  trackReviewEvent('ready_branch_started', { sessionId: session.id })
  return session
}

/** Starts coordination seed for a real decline path — no hardcoded result. */
export function startDeclineBranchSession(): MeetingDecisionSession {
  const session = persistFresh(createSession('coordination'))
  trackReviewEvent('decline_branch_started', { sessionId: session.id })
  return session
}

export function startLabProductSession(
  attendanceTypes: Record<string, AttendanceType>,
): MeetingDecisionSession {
  const session = persistFresh(
    createSessionFromAttendance(attendanceTypes, 'coordination'),
  )
  trackReviewEvent('lab_product_flow_started', { sessionId: session.id })
  return session
}

export function organizerPath(sessionId: string, review = true): string {
  const path = `/prototype/session/${sessionId}/organizer`
  if (review) return withReviewQuery(path)
  return preserveModeQuery(path)
}

export function attendeePath(
  sessionId: string,
  requestId: string,
  review = true,
): string {
  const path = `/prototype/session/${sessionId}/respond/${requestId}`
  if (review) return withReviewQuery(path)
  return preserveModeQuery(path)
}

export function completionPath(sessionId: string): string {
  return withReviewQuery(`/review/session/${sessionId}/complete`)
}
