import { Button } from '@/components/ui/Button'
import { TextButton } from '@/components/ui/TextButton'
import { TextField } from '@/components/ui/TextField'
import type { MeetingDraft } from '@/types/schedule'

interface MeetingDetailsProps {
  dateDisplay: string
  timeLabel: string
  meeting: MeetingDraft
  onChange: (draft: Partial<MeetingDraft>) => void
  onSubmit: () => void
  onBack: () => void
}

export function MeetingDetails({
  dateDisplay,
  timeLabel,
  meeting,
  onChange,
  onSubmit,
  onBack,
}: MeetingDetailsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[20px] bg-background px-7 py-8 sm:px-8">
        <h2 className="mb-6 text-[20px] font-semibold leading-7 text-grey-900">
          이 시간으로 회의를 만들까요?
        </h2>

        <div className="mb-6">
          <p className="mb-1.5 text-[15px] text-grey-600">{dateDisplay}</p>
          <p className="text-[28px] font-bold leading-9 text-grey-900">
            {timeLabel}
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <TextField
            label="회의 제목"
            value={meeting.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
          <TextField
            label="장소 또는 화상 회의 링크"
            value={meeting.location}
            onChange={(e) => onChange({ location: e.target.value })}
          />
        </div>

        <Button onClick={onSubmit}>회의 만들기</Button>
        <div className="mt-4 flex justify-center">
          <TextButton onClick={onBack}>시간 다시 보기</TextButton>
        </div>
      </div>
    </div>
  )
}
