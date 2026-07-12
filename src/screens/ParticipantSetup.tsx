import { ParticipantRow } from '@/components/ParticipantRow'
import { Button } from '@/components/ui/Button'
import type { AttendanceType, Participant } from '@/types/schedule'

interface ParticipantSetupProps {
  participants: Participant[]
  onAttendanceTypeChange: (id: string, type: AttendanceType) => void
  onFindTime: () => void
}

export function ParticipantSetup({
  participants,
  onAttendanceTypeChange,
  onFindTime,
}: ParticipantSetupProps) {
  const required = participants.filter((p) => p.attendanceType === 'required')
  const optional = participants.filter((p) => p.attendanceType === 'optional')

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-6">
      <div>
        <h2 className="mb-2 text-[24px] font-bold leading-[34px] tracking-tight text-meeting-text">
          누구와 회의할까요?
        </h2>
        <p className="mb-3 text-[15px] leading-[23px] text-meeting-text-secondary">
          다음 주에 1시간 동안 만날 동료를 선택해주세요.
        </p>
        <p className="text-[13px] text-meeting-text-tertiary">
          다음 주 · 1시간 · 주최자 포함 {participants.length}명
        </p>
      </div>

      <section className="rounded-[var(--meeting-radius-card)] bg-meeting-surface px-5 py-2 shadow-[var(--meeting-shadow)]">
        <h3 className="px-1 pt-3 text-[13px] font-semibold text-meeting-text-secondary">
          꼭 참석해야 하는 사람
        </h3>
        <div className="divide-y divide-meeting-divider">
          {required.map((person) => (
            <ParticipantRow
              key={person.id}
              participant={person}
              onAttendanceTypeChange={onAttendanceTypeChange}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[var(--meeting-radius-card)] bg-meeting-surface px-5 py-2 shadow-[var(--meeting-shadow)]">
        <h3 className="px-1 pt-3 text-[13px] font-semibold text-meeting-text-secondary">
          참석하면 좋은 사람
        </h3>
        <div className="divide-y divide-meeting-divider">
          {optional.map((person) => (
            <ParticipantRow
              key={person.id}
              participant={person}
              onAttendanceTypeChange={onAttendanceTypeChange}
            />
          ))}
        </div>
      </section>

      <Button onClick={onFindTime}>시간 찾기</Button>
    </div>
  )
}
