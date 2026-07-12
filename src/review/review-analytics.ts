export type ReviewEvent =
  | 'review_landing_viewed'
  | 'core_flow_started'
  | 'design_note_opened'
  | 'actor_transition_opened'
  | 'core_flow_completed'
  | 'ready_branch_started'
  | 'decline_branch_started'
  | 'rule_lab_opened'
  | 'lab_condition_changed'
  | 'lab_product_flow_started'

type ReviewEventPayload = Record<string, string | number | boolean | undefined>

export function trackReviewEvent(
  event: ReviewEvent,
  payload: ReviewEventPayload = {},
) {
  if (typeof window === 'undefined') return
  const detail = { event, ...payload, at: Date.now() }
  window.dispatchEvent(new CustomEvent('toss-review-event', { detail }))
  if (import.meta.env.DEV) {
    console.info('[review]', event, payload)
  }
}
