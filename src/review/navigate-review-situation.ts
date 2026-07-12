import type { NavigateFunction } from 'react-router-dom'
import { clearSession } from '@/features/meeting-decision/connected-flow/connected-flow.persistence'
import { withReviewQuery } from '@/review/review-mode'
import {
  organizerPath,
  startCoreReviewSession,
  startDeclineBranchSession,
  startReadyReviewSession,
} from '@/review/review-session.factory'
import {
  setReviewSituationHint,
  type ReviewSituationId,
} from '@/review/review-situations'

/**
 * Shared situation navigation for Review Chrome dropdown and
 * Review Completion inline scenario picker.
 * Returns whether navigation started (false when re-selecting current).
 */
export function navigateReviewSituation(
  id: ReviewSituationId,
  current: ReviewSituationId | null,
  navigate: NavigateFunction,
): boolean {
  if (id === current) {
    return false
  }

  if (id === 'landing') {
    clearSession()
    setReviewSituationHint('landing')
    navigate(withReviewQuery('/'))
    return true
  }

  if (id === 'lab') {
    setReviewSituationHint('lab')
    navigate(withReviewQuery('/lab'))
    return true
  }

  const factory =
    id === 'ready'
      ? startReadyReviewSession
      : id === 'decline'
        ? startDeclineBranchSession
        : startCoreReviewSession

  const session = factory()
  navigate(organizerPath(session.id))
  return true
}
