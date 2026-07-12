import type { AttendanceType, Participant } from '@/types/schedule'

type ParticipantRowProps = {
  participant: Participant
  editable?: boolean
  onAttendanceTypeChange: (id: string, type: AttendanceType) => void
}

export function ParticipantRow({
  participant,
  editable = false,
  onAttendanceTypeChange,
}: ParticipantRowProps) {
  const isOrganizer = Boolean(participant.isOrganizer)

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-[16px] font-medium text-meeting-text">
          {participant.name}
        </p>
        <p className="truncate text-[13px] text-meeting-text-tertiary">
          {isOrganizer
            ? '주최자 · 필수 참석'
            : participant.role}
        </p>
      </div>

      {isOrganizer || !editable ? (
        <div
          className="flex shrink-0 gap-1 rounded-full bg-meeting-panel p-1"
          aria-disabled
        >
          {(['required', 'optional'] as const).map((type) => {
            const active = participant.attendanceType === type
            return (
              <span
                key={type}
                className={[
                  'inline-flex min-h-9 items-center rounded-full px-3 text-[13px] font-medium',
                  active
                    ? 'bg-meeting-surface text-meeting-text shadow-sm'
                    : 'text-meeting-text-tertiary',
                ].join(' ')}
              >
                {type === 'required' ? '필수' : '선택'}
              </span>
            )
          })}
        </div>
      ) : (
        <div className="flex shrink-0 gap-1 rounded-full bg-meeting-panel p-1">
          {(['required', 'optional'] as const).map((type) => {
            const active = participant.attendanceType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => onAttendanceTypeChange(participant.id, type)}
                className={[
                  'min-h-9 rounded-full px-3 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]',
                  active
                    ? 'bg-meeting-surface text-meeting-text shadow-sm'
                    : 'text-meeting-text-secondary hover:text-meeting-text',
                ].join(' ')}
              >
                {type === 'required' ? '필수' : '선택'}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
