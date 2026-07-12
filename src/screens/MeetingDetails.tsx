import { useId, useRef, useState } from 'react'
import { MeetingParticipantsSummary } from '@/components/meeting/MeetingParticipantsSummary'
import { Button } from '@/components/ui/Button'
import { TextButton } from '@/components/ui/TextButton'
import { TextField } from '@/components/ui/TextField'
import { productCopy } from '@/copy/product.copy'
import { isMeetingTitleValid } from '@/lib/meeting-display'
import type { MeetingDraft } from '@/types/schedule'

interface MeetingDetailsProps {
  dateDisplay: string
  timeLabel: string
  meeting: MeetingDraft
  creating?: boolean
  onChange: (draft: Partial<MeetingDraft>) => void
  onSubmit: () => boolean | void
  onBack: () => void
}

export function MeetingDetails({
  dateDisplay,
  timeLabel,
  meeting,
  creating = false,
  onChange,
  onSubmit,
  onBack,
}: MeetingDetailsProps) {
  const copy = productCopy.meetingDetails
  const [submitting, setSubmitting] = useState(false)
  const [titleError, setTitleError] = useState(false)
  const isComposingRef = useRef(false)
  const submittedRef = useRef(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const titleErrorId = useId()
  const busy = submitting || creating

  const clearTitleErrorIfValid = (value: string) => {
    if (isMeetingTitleValid(value)) {
      setTitleError(false)
    }
  }

  const handleSubmit = () => {
    if (busy || submittedRef.current || isComposingRef.current) return
    if (!isMeetingTitleValid(meeting.title)) {
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
      <div className="rounded-[var(--meeting-radius-card)] bg-meeting-surface p-8 shadow-[var(--meeting-shadow)] max-[360px]:px-5">
        <h2
          data-page-heading
          tabIndex={-1}
          className="mb-6 text-[20px] font-semibold leading-7 text-meeting-text outline-none focus:outline-none focus-visible:outline-none"
          style={{ wordBreak: 'keep-all' }}
        >
          {copy.title}
        </h2>

        <div className="mb-5">
          <p className="mb-1.5 text-[18px] font-semibold leading-[26px] text-meeting-text-secondary">
            {dateDisplay}
          </p>
          <p className="text-[36px] font-bold leading-[46px] text-meeting-text">
            {timeLabel}
          </p>
        </div>

        <MeetingParticipantsSummary
          participants={meeting.participants}
          className="mb-8"
        />

        <div className="mb-6 flex flex-col gap-4">
          <div>
            <TextField
              ref={titleInputRef}
              id="meeting-title"
              label={copy.titleField}
              value={meeting.title}
              required
              autoComplete="off"
              placeholder={copy.titlePlaceholder}
              invalid={titleError}
              errorId={titleErrorId}
              onCompositionStart={() => {
                isComposingRef.current = true
              }}
              onCompositionEnd={(e) => {
                isComposingRef.current = false
                clearTitleErrorIfValid(e.currentTarget.value)
              }}
              onChange={(e) => {
                const value = e.target.value
                onChange({ title: value })
                if (!isComposingRef.current) {
                  clearTitleErrorIfValid(value)
                }
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
            label={copy.locationField}
            value={meeting.location}
            autoComplete="off"
            placeholder={copy.locationPlaceholder}
            onChange={(e) => onChange({ location: e.target.value })}
          />
        </div>

        <Button type="button" disabled={busy} onClick={handleSubmit}>
          {busy ? copy.creating : copy.primaryAction}
        </Button>
        <div className="mt-4 flex justify-center">
          <TextButton type="button" onClick={onBack} disabled={busy}>
            {copy.secondaryAction}
          </TextButton>
        </div>
      </div>
    </div>
  )
}
