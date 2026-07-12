export type AttendanceType = 'required' | 'optional'

export type SoftConstraintKind =
  | 'preference'
  | 'travel'
  | 'meeting-density'

export type SlotState =
  | { type: 'free' }
  | { type: 'hard-busy'; publicLabel: string }
  | {
      type: 'protected'
      requestable: true
      publicLabel: '개인 보호 시간'
    }
  | {
      type: 'soft-penalty'
      kind: SoftConstraintKind
      penalty: number
      publicLabel: string
    }

export type TimeSlotId =
  | 'mon-10'
  | 'mon-16'
  | 'tue-13'
  | 'wed-15'
  | 'thu-10'
  | 'thu-15'
  | 'fri-11'
  | 'fri-16'

export type TimeSlot = {
  id: TimeSlotId
  startAt: string
  endAt: string
  dateLabel: string
  timeLabel: string
}

export type ResponseOverride = 'approved' | 'declined'

export type ResponseOverrides = Partial<
  Record<string, Partial<Record<TimeSlotId, ResponseOverride>>>
>

export type ParticipantImpactStatus =
  | 'required-available'
  | 'required-confirmation'
  | 'required-available-with-note'
  | 'optional-available'
  | 'optional-unavailable'
  | 'optional-available-with-note'

export type ParticipantImpact = {
  participantId: string
  name: string
  attendanceType: AttendanceType
  status: ParticipantImpactStatus
  label: string
  publicContext?: string
}

export type ConfirmationTarget = {
  participantId: string
  name: string
  publicLabel: string
}

export type ReasonRow = {
  key: 'required' | 'confirmation' | 'travel' | 'preference' | 'optional'
  label: string
  value: string
}

export type SlotEvaluation = {
  slot: TimeSlot
  requiredHardConflictCount: number
  requiredConfirmationTargets: ConfirmationTarget[]
  requiredSoftPenalty: number
  optionalAvailableCount: number
  optionalTotalCount: number
  optionalSoftPenalty: number
  requiredTotalCount: number
  requiredAvailableCount: number
  participantImpacts: ParticipantImpact[]
  reasonRows: ReasonRow[]
}

export type MeetingRecommendation =
  | {
      status: 'READY'
      evaluation: SlotEvaluation
    }
  | {
      status: 'NEED_CONFIRMATION'
      evaluation: SlotEvaluation
      confirmationTargets: ConfirmationTarget[]
    }
  | {
      status: 'NO_OPTION'
      evaluations: SlotEvaluation[]
      blockingSummary: string
    }

export type DecisionParticipant = {
  id: string
  name: string
  role: string
  isOrganizer: boolean
  defaultAttendanceType: AttendanceType
  contextSummary?: string
  schedule: Partial<Record<TimeSlotId, SlotState>>
}

export type ScenarioPresetId = 'coordination' | 'ready' | 'rejected'

export type ScenarioPreset = {
  id: ScenarioPresetId
  attendanceTypes: Record<string, AttendanceType>
  responseOverrides: ResponseOverrides
}
