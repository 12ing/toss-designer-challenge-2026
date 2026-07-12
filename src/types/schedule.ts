export type AttendanceType = 'required' | 'optional'

export type Participant = {
  id: string
  name: string
  role: string
  attendanceType: AttendanceType
  isOrganizer?: boolean
}

export type ScenarioId = 'ready' | 'need-confirmation' | 'rejected'

export type DecisionState =
  | 'scenario-hub'
  | 'participant-setup'
  | 'analyzing'
  | 'ready'
  | 'reason-expanded'
  | 'meeting-details'
  | 'completed'
  | 'need-confirmation'
  | 'request-preview'
  | 'waiting'
  | 'attendee-request'
  | 'attendee-approved'
  | 'attendee-rejected'
  | 'ready-after-confirmation'
  | 'next-alternative'

export type DecisionCardState =
  | 'ready'
  | 'need-confirmation'
  | 'waiting'
  | 'ready-after-confirmation'
  | 'next-alternative'

export type ReadyScenario = {
  id: 'ready'
  date: string
  dayLabel: string
  timeLabel: string
  dateDisplay: string
  requiredAvailable: number
  requiredTotal: number
  optionalAvailable: number
  optionalTotal: number
  reasons: string[]
  details: string[]
  disclosureNote: string
}

export type ConfirmationScenario = {
  id: 'need-confirmation'
  date: string
  dayLabel: string
  timeLabel: string
  dateDisplay: string
  targetParticipantId: string
  targetParticipantName: string
  conflictType: string
  requiredAvailable: number
  requiredTotal: number
  optionalAvailable: number
  optionalTotal: number
  resultMessage: string
}

export type RejectedScenario = {
  id: 'rejected'
  previousDate: string
  previousTimeLabel: string
  nextDate: string
  nextDayLabel: string
  nextTimeLabel: string
  nextDateDisplay: string
  targetParticipantId: string
  targetParticipantName: string
  conflictType: string
  requiredAvailable: number
  requiredTotal: number
  optionalAvailable: number
  optionalTotal: number
  resultMessage: string
}

export type MeetingDraft = {
  title: string
  location: string
}
