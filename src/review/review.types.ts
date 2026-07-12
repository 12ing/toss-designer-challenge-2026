export type ReviewStep =
  | 'attendance-conditions'
  | 'time-recommendation'
  | 'confirmation-request'
  | 'attendee-response'
  | 'meeting-confirmation'

export type ReviewNote = {
  title: string
  problem: string
  rule: string
  omitted: string
}

export type ReviewStepMeta = {
  id: ReviewStep
  index: number
  total: number
  label: string
}
