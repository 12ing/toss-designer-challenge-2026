import type { DecisionSurfaceMode } from '@/features/meeting-decision/view-model/decision-surface.mapper'
import type { DecisionState } from '@/types/schedule'
import type { MeetingDecisionSession } from './connected-flow.types'

/** Map session phase + recommendation into the existing DecisionSurface mode. */
export function toDecisionSurfaceMode(
  session: MeetingDecisionSession,
): DecisionSurfaceMode | null {
  const rec = session.currentRecommendation
  if (!rec) return null

  if (session.phase === 'organizer-waiting') {
    return 'waiting'
  }

  if (session.phase === 'organizer-updated-result') {
    if (session.isReadyAfterConfirmation && rec.status === 'READY') {
      return 'ready-after-confirmation'
    }
    if (session.isNextAlternative) {
      return 'next-alternative'
    }
  }

  if (
    session.phase === 'organizer-result' ||
    session.phase === 'organizer-updated-result'
  ) {
    if (rec.status === 'READY') return 'ready'
    if (rec.status === 'NO_OPTION') return 'no-option'
    if (rec.status === 'NEED_CONFIRMATION') {
      return session.isNextAlternative ? 'next-alternative' : 'need-confirmation'
    }
  }

  return null
}

/** Compatibility mapping for ReviewNav and legacy screen switches. */
export function toLegacyDecisionState(
  session: MeetingDecisionSession,
): DecisionState {
  switch (session.phase) {
    case 'participant-setup':
      return 'participant-setup'
    case 'analyzing':
      return 'analyzing'
    case 'request-preview':
    case 'sending-request':
      return 'request-preview'
    case 'organizer-waiting':
      return 'waiting'
    case 'attendee-request':
    case 'attendee-submitting':
      return 'attendee-request'
    case 'attendee-approved':
      return 'attendee-approved'
    case 'attendee-declined':
      return 'attendee-rejected'
    case 'meeting-details':
      return 'meeting-details'
    case 'completed':
      return 'completed'
    case 'review-complete':
      return 'review-complete'
    case 'organizer-result':
    case 'organizer-updated-result': {
      const mode = toDecisionSurfaceMode(session)
      if (mode === 'waiting') return 'waiting'
      if (mode === 'ready-after-confirmation') return 'ready-after-confirmation'
      if (mode === 'next-alternative') return 'next-alternative'
      if (mode === 'no-option') return 'no-option'
      if (mode === 'need-confirmation') return 'need-confirmation'
      if (mode === 'ready') return 'ready'
      return 'need-confirmation'
    }
    default:
      return 'participant-setup'
  }
}
