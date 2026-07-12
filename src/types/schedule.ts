export type AttendanceType = 'required' | 'optional'

export type Participant = {
  id: string
  name: string
  role: string
  attendanceType: AttendanceType
  isOrganizer?: boolean
}

/** @deprecated 프리셋 ID는 ScenarioPresetId 사용. 호환용 별칭 */
export type ScenarioId =
  | 'ready'
  | 'need-confirmation'
  | 'rejected'
  | 'coordination'

export type DecisionState =
  | 'participant-setup'
  | 'analyzing'
  | 'ready'
  | 'reason-expanded'
  | 'meeting-details'
  | 'completed'
  | 'review-complete'
  | 'need-confirmation'
  | 'request-preview'
  | 'waiting'
  | 'attendee-request'
  | 'attendee-approved'
  | 'attendee-rejected'
  | 'ready-after-confirmation'
  | 'next-alternative'
  | 'no-option'

export type DecisionCardState =
  | 'ready'
  | 'need-confirmation'
  | 'waiting'
  | 'ready-after-confirmation'
  | 'next-alternative'

export type MeetingDraft = {
  title: string
  location: string
}
