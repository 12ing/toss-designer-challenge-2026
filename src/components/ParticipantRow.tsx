import type { AttendanceType, Participant } from '@/types/schedule'

type ParticipantRowProps = {
  participant: Participant
  onAttendanceTypeChange: (id: string, type: AttendanceType) => void
}

export function ParticipantRow({
  participant,
  onAttendanceTypeChange,
}: ParticipantRowProps) {
  const isOrganizer = Boolean(participant.isOrganizer)

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-[16px] font-medium text-meeting-text">
          {participant.name}
          {isOrganizer && (
            <span className="ml-2 text-[13px] font-medium text-meeting-text-tertiary">
              주최자
            </span>
          )}
        </p>
        <p className="truncate text-[13px] text-meeting-text-tertiary">
          {participant.role}
        </p>
      </div>

      {isOrganizer ? (
        <span className="shrink-0 rounded-full bg-meeting-panel px-3 py-1.5 text-[13px] font-medium text-meeting-text-secondary">
          필수
        </span>
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
                    : 'text-meeting-text-tertiary hover:text-meeting-text-secondary',
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
