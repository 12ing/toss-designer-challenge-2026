import { AttendanceTypeControl } from '@/components/participant-setup/AttendanceTypeControl'
import { OrganizerFixedStatus } from '@/components/participant-setup/OrganizerFixedStatus'
import type { ParticipantSetupRowViewModel } from '@/features/meeting-decision/view-model/participant-setup.mapper'
import type { AttendanceType } from '@/types/schedule'

type ParticipantConditionRowProps = {
  row: ParticipantSetupRowViewModel
  onAttendanceTypeChange: (id: string, type: AttendanceType) => void
}

export function ParticipantConditionRow({
  row,
  onAttendanceTypeChange,
}: ParticipantConditionRowProps) {
  const showPublicContext =
    !row.isOrganizer &&
    row.publicContext.kind !== 'none' &&
    row.publicContext.label.length > 0 &&
    row.publicContext.label !== '공유된 추가 조건 없음'

  const renderAttendance = () =>
    row.attendanceLocked ? (
      <OrganizerFixedStatus />
    ) : (
      <AttendanceTypeControl
        name={row.name}
        value={row.attendanceType}
        onChange={(type) => onAttendanceTypeChange(row.id, type)}
      />
    )

  return (
    <div
      className="grid grid-cols-1 gap-3 py-3.5 min-[640px]:grid-cols-[minmax(140px,1.1fr)_minmax(150px,1.2fr)_minmax(120px,auto)] min-[640px]:items-center min-[640px]:gap-5"
      aria-label={row.accessibleSummary}
    >
      <div className="flex min-w-0 items-start justify-between gap-3 min-[640px]:block">
        <div className="min-w-0">
          <p className="text-[16px] font-semibold leading-6 text-meeting-text">
            {row.name}
          </p>
          <p className="mt-0.5 text-[13px] font-normal leading-5 text-meeting-text-tertiary">
            {row.roleLabel}
          </p>
          {showPublicContext ? (
            <p
              className="mt-1 text-[13px] font-medium leading-5 text-meeting-text-secondary min-[640px]:hidden"
              style={{ wordBreak: 'keep-all' }}
            >
              {row.publicContext.label}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 min-[640px]:hidden">{renderAttendance()}</div>
      </div>

      <div className="hidden min-w-0 min-[640px]:block">
        {showPublicContext ? (
          <p
            className="text-[13px] font-medium leading-5 text-meeting-text-secondary"
            style={{ wordBreak: 'keep-all' }}
          >
            {row.publicContext.label}
          </p>
        ) : null}
      </div>

      <div className="hidden justify-self-end min-[640px]:block">
        {renderAttendance()}
      </div>
    </div>
  )
}
