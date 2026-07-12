import type {
  AttendanceType,
  MeetingRecommendation,
  ResponseOverrides,
  ScenarioPresetId,
  TimeSlotId,
} from '@/features/meeting-decision/engine/decision-engine.types'
import type { MeetingDraft, MeetingParticipantSnapshot } from '@/types/schedule'

export type { MeetingParticipantSnapshot }

export type PrototypeActor = 'organizer' | 'attendee'

export type SchedulingRequestStatus =
  | 'draft'
  | 'sent'
  | 'pending'
  | 'approved'
  | 'declined'
  | 'resolved'

export type SchedulingRequest = {
  id: string
  meetingDraftId: string
  slotId: TimeSlotId
  dateLabel: string
  timeLabel: string
  organizerId: string
  organizerName: string
  targetParticipantId: string
  targetParticipantName: string
  conflictPublicLabel: string
  meetingTitle: string
  status: SchedulingRequestStatus
  createdAt: string
  respondedAt?: string
  response?: 'approved' | 'declined'
}

/** Immutable record written once when a meeting is created. */
export type MeetingRecord = {
  id: string
  sessionId: string
  meetingDraftId: string
  slotId: TimeSlotId
  dateLabel: string
  timeLabel: string
  title: string
  location: string
  participants: MeetingParticipantSnapshot[]
  requiredCount: number
  optionalCount: number
  createdAt: string
}

export type ConnectedFlowPhase =
  | 'participant-setup'
  | 'analyzing'
  | 'organizer-result'
  | 'request-preview'
  | 'sending-request'
  | 'organizer-waiting'
  | 'attendee-request'
  | 'attendee-submitting'
  | 'attendee-approved'
  | 'attendee-declined'
  | 'organizer-updated-result'
  | 'meeting-details'
  | 'completed'
  | 'review-complete'

export type MeetingDecisionSession = {
  id: string
  meetingDraftId: string
  organizerId: string
  participantIds: string[]
  attendanceTypes: Record<string, AttendanceType>
  currentRecommendation: MeetingRecommendation | null
  previousRecommendation?: MeetingRecommendation
  responseOverrides: ResponseOverrides
  activeRequest?: SchedulingRequest
  /** True when current result is a post-decline alternative */
  isNextAlternative: boolean
  /** True when result follows an approved confirmation */
  isReadyAfterConfirmation: boolean
  actor: PrototypeActor
  phase: ConnectedFlowPhase
  /** In-progress meeting details form draft */
  meeting: MeetingDraft
  /** Persisted created meeting — source of truth after create */
  createdMeeting?: MeetingRecord
  /** Convenience mirror of createdMeeting.createdAt */
  meetingCreatedAt?: string
  scenarioSeed: ScenarioPresetId
  createdAt: string
  updatedAt: string
}

export const SESSION_STORAGE_KEY = 'toss-meeting-decision-session-v1'
