import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TextButton } from '@/components/ui/TextButton'
import { TextField } from '@/components/ui/TextField'
import type { MeetingDraft } from '@/types/schedule'

interface MeetingDetailsProps {
  dateDisplay: string
  timeLabel: string
  requiredCount: number
  optionalCount: number
  meeting: MeetingDraft
  onChange: (draft: Partial<MeetingDraft>) => void
  onSubmit: () => boolean | void
  onBack: () => void
}

export function MeetingDetails({
  dateDisplay,
  timeLabel,
  requiredCount,
  optionalCount,
  meeting,
  onChange,
  onSubmit,
  onBack,
}: MeetingDetailsProps) {
  const [submitting, setSubmitting] = useState(false)
  const submittedRef = useRef(false)
  const titleTrimmed = meeting.title.trim()
  const canSubmit = titleTrimmed.length > 0 && !submitting

  const handleSubmit = () => {
    if (!canSubmit || submittedRef.current) return
    submittedRef.current = true
    setSubmitting(true)
    const ok = onSubmit()
    if (ok === false) {
      submittedRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="rounded-[var(--meeting-radius-card)] bg-meeting-surface p-8 shadow-[var(--meeting-shadow)]">
        <h2
          className="mb-6 text-[20px] font-semibold leading-7 text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          이 시간으로 회의를 만들까요?
        </h2>

        <div className="mb-6">
          <p className="mb-1.5 text-[18px] font-semibold leading-[26px] text-meeting-text-secondary">
            {dateDisplay}
          </p>
          <p className="text-[36px] font-bold leading-[46px] text-meeting-text">
            {timeLabel}
          </p>
          <div className="mt-3 flex flex-col gap-0.5 text-[14px] leading-[21px] text-meeting-text-secondary">
            <p>필수 참석자 {requiredCount}명</p>
            <p>선택 참석자 {optionalCount}명</p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <TextField
            label="회의 제목"
            value={meeting.title}
            required
            autoComplete="off"
            placeholder="회의 제목을 입력하세요"
            onChange={(e) => onChange({ title: e.target.value })}
          />
          <TextField
            label="장소 또는 화상 회의 링크"
            value={meeting.location}
            autoComplete="off"
            placeholder="선택 사항"
            onChange={(e) => onChange({ location: e.target.value })}
          />
        </div>

        <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
          {submitting ? '만드는 중' : '회의 만들기'}
        </Button>
        <div className="mt-4 flex justify-center">
          <TextButton type="button" onClick={onBack}>
            시간 다시 보기
          </TextButton>
        </div>
      </div>
    </div>
  )
}
