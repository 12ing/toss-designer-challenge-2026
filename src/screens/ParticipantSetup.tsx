import { ParticipantRow } from '@/components/ParticipantRow'
import { Button } from '@/components/ui/Button'
import type { AttendanceType, Participant } from '@/types/schedule'

interface ParticipantSetupProps {
  participants: Participant[]
  /** 시나리오 일관성을 위해 편집이 비활성화될 수 있습니다. */
  editable?: boolean
  onAttendanceTypeChange: (id: string, type: AttendanceType) => void
  onFindTime: () => void
}

export function ParticipantSetup({
  participants,
  editable = false,
  onAttendanceTypeChange,
  onFindTime,
}: ParticipantSetupProps) {
  const requiredCount = participants.filter(
    (p) => p.attendanceType === 'required',
  ).length
  const optionalCount = participants.length - requiredCount

  const summary =
    optionalCount === 0
      ? `필수 ${requiredCount}명 · 선택 없음`
      : `필수 ${requiredCount}명 · 선택 ${optionalCount}명`

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-6">
      <div>
        <h2
          className="mb-2 text-[24px] font-bold leading-[34px] tracking-tight text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          참석 조건을 확인해주세요
        </h2>
        <p
          className="mb-3 text-[15px] leading-[23px] text-meeting-text-secondary"
          style={{ wordBreak: 'keep-all' }}
        >
          필수 참석자가 모두 가능한 시간을 우선해서 찾을게요.
        </p>
        <p className="text-[13px] text-meeting-text-tertiary">
          다음 주 · 1시간 · 6명
        </p>
      </div>

      <p className="text-[14px] font-medium text-meeting-text-secondary">
        {summary}
      </p>

      <section className="rounded-[var(--meeting-radius-card)] bg-meeting-surface px-5 py-2 shadow-[var(--meeting-shadow)]">
        <div className="divide-y divide-meeting-divider">
          {participants.map((person) => (
            <ParticipantRow
              key={person.id}
              participant={person}
              editable={editable && !person.isOrganizer}
              onAttendanceTypeChange={onAttendanceTypeChange}
            />
          ))}
        </div>
      </section>

      <Button onClick={onFindTime}>이 조건으로 시간 찾기</Button>
    </div>
  )
}
