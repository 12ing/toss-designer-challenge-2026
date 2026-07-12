import { useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TextButton } from '@/components/ui/TextButton'
import { TextField } from '@/components/ui/TextField'
import { PRODUCT_TERMS } from '@/copy/product.copy'
import { sanitizeMeetingDisplayText } from '@/lib/meeting-display'
import type { MeetingDraft } from '@/types/schedule'

interface MeetingDetailsProps {
  dateDisplay: string
  timeLabel: string
  requiredCount: number
  optionalCount: number
  meeting: MeetingDraft
  creating?: boolean
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
  creating = false,
  onChange,
  onSubmit,
  onBack,
}: MeetingDetailsProps) {
  const [submitting, setSubmitting] = useState(false)
  const [titleError, setTitleError] = useState(false)
  const submittedRef = useRef(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const titleErrorId = useId()
  const titleTrimmed = sanitizeMeetingDisplayText(meeting.title)
  const busy = submitting || creating

  const handleSubmit = () => {
    if (busy || submittedRef.current) return
    if (!titleTrimmed) {
      setTitleError(true)
      titleInputRef.current?.focus()
      return
    }
    setTitleError(false)
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
          data-page-heading
          tabIndex={-1}
          className="mb-6 text-[20px] font-semibold leading-7 text-meeting-text outline-none focus:outline-none focus-visible:outline-none"
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
            <p>
              {PRODUCT_TERMS.requiredAttendee} {requiredCount}명
            </p>
            <p>
              {PRODUCT_TERMS.optionalAttendee} {optionalCount}명
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <div>
            <TextField
              ref={titleInputRef}
              id="meeting-title"
              label="회의 제목"
              value={meeting.title}
              required
              autoComplete="off"
              placeholder="회의 제목을 입력하세요"
              invalid={titleError}
              errorId={titleErrorId}
              onChange={(e) => {
                setTitleError(false)
                onChange({ title: e.target.value })
              }}
            />
            {titleError ? (
              <p
                id={titleErrorId}
                role="alert"
                className="mt-1.5 text-[13px] font-medium text-[#f04452]"
              >
                회의 제목을 입력해 주세요.
              </p>
            ) : null}
          </div>
          <TextField
            label="장소 또는 화상 회의 링크"
            value={meeting.location}
            autoComplete="off"
            placeholder="예: 4층 A 또는 화상 회의 링크"
            onChange={(e) => onChange({ location: e.target.value })}
          />
        </div>

        <Button type="button" disabled={busy} onClick={handleSubmit}>
          {busy ? '만드는 중' : PRODUCT_TERMS.createMeeting}
        </Button>
        <div className="mt-4 flex justify-center">
          <TextButton type="button" onClick={onBack} disabled={busy}>
            시간 다시 보기
          </TextButton>
        </div>
      </div>
    </div>
  )
}
