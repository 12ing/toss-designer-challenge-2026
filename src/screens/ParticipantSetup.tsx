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
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-2 text-[24px] font-bold leading-8 tracking-tight text-grey-900">
          누구와 회의할까요?
        </h2>
        <p className="mb-3 text-[15px] leading-6 text-grey-600">
          다음 주에 1시간 동안 만날 동료를 선택해주세요.
        </p>
        <p className="text-[13px] text-grey-500">
          다음 주 · 1시간 · 주최자 포함 {participants.length}명
        </p>
      </div>

      <section className="rounded-[20px] bg-background px-5 py-2">
        <h3 className="px-1 pt-3 text-[13px] font-semibold text-grey-700">
          꼭 참석해야 하는 사람
        </h3>
        <div className="divide-y divide-hairline">
          {required.map((person) => (
            <ParticipantRow
              key={person.id}
              participant={person}
              onAttendanceTypeChange={onAttendanceTypeChange}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[20px] bg-background px-5 py-2">
        <h3 className="px-1 pt-3 text-[13px] font-semibold text-grey-700">
          참석하면 좋은 사람
        </h3>
        <div className="divide-y divide-hairline">
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
