import { decisionParticipants } from '@/features/meeting-decision/data/participants'
import { getPublicContextForParticipant } from '@/features/meeting-decision/privacy/public-scheduling-context.mapper'
import type { AttendanceType } from '@/features/meeting-decision/engine/decision-engine.types'
import type { PublicSchedulingContextKind } from '@/features/meeting-decision/privacy/public-scheduling-context.mapper'

export type ParticipantSetupRowViewModel = {
  id: string
  name: string
  role: string
  /** Display role line, e.g. `PO · 주최자` for organizer */
  roleLabel: string
  isOrganizer: boolean
  attendanceType: AttendanceType
  attendanceLocked: boolean
  publicContext: {
    kind: PublicSchedulingContextKind
    label: string
  }
  accessibleSummary: string
}

export type ParticipantSetupViewModel = {
  requiredCount: number
  optionalCount: number
  summaryLabel: string
  rows: ParticipantSetupRowViewModel[]
}

export function formatAttendanceSummary(
  requiredCount: number,
  optionalCount: number,
) {
  if (optionalCount === 0) {
    return `필수 ${requiredCount}명 · 선택 없음`
  }
  return `필수 ${requiredCount}명 · 선택 ${optionalCount}명`
}

export function mapParticipantsToSetupViewModel(params: {
  attendanceTypes: Record<string, AttendanceType>
}): ParticipantSetupViewModel {
  const rows: ParticipantSetupRowViewModel[] = decisionParticipants.map(
    (person) => {
      const attendanceType = person.isOrganizer
        ? 'required'
        : (params.attendanceTypes[person.id] ?? person.defaultAttendanceType)
      const context = getPublicContextForParticipant(person.id)
      const roleLabel = person.isOrganizer
        ? `${person.role} · 주최자`
        : person.role
      const roleTag = attendanceType === 'required' ? '필수' : '선택'

      const accessibleSummary = person.isOrganizer
        ? `${person.name}, ${person.role}, 주최자, 필수 참석 고정`
        : `${person.name}, ${person.role}, ${context.shortLabel}, ${roleTag} 참석자로 설정됨`

      return {
        id: person.id,
        name: person.name,
        role: person.role,
        roleLabel,
        isOrganizer: person.isOrganizer,
        attendanceType,
        attendanceLocked: person.isOrganizer,
        publicContext: {
          kind: context.kind,
          label: context.shortLabel,
        },
        accessibleSummary,
      }
    },
  )

  const requiredCount = rows.filter((r) => r.attendanceType === 'required').length
  const optionalCount = rows.length - requiredCount

  return {
    requiredCount,
    optionalCount,
    summaryLabel: formatAttendanceSummary(requiredCount, optionalCount),
    rows,
  }
}
