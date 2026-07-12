import { DateTimeBlock } from '@/components/DateTimeBlock'

interface AttendeeRequestProps {
  dateDisplay: string
  timeLabel: string
  meetingTitle: string
  organizerName: string
  conflictLabel: string
  loading: boolean
  onApprove: () => void
  onReject: () => void
}

const choiceButtonClass =
  'inline-flex w-full min-h-14 items-center justify-center rounded-[var(--meeting-radius-button)] border border-meeting-divider bg-meeting-surface px-5 text-[16px] font-semibold leading-6 text-meeting-text transition-[background-color,color] duration-[var(--meeting-motion-quick)] ease-[var(--meeting-ease-standard)] hover:bg-meeting-primary-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)] disabled:opacity-50'

export function AttendeeRequest({
  dateDisplay,
  timeLabel,
  meetingTitle,
  organizerName,
  conflictLabel,
  loading,
  onApprove,
  onReject,
}: AttendeeRequestProps) {
  return (
    <div className="flex flex-1 flex-col">
      <p className="mb-2 text-[13px] text-meeting-text-tertiary">
        {organizerName} · {meetingTitle}
      </p>
      <div className="mb-6">
        <DateTimeBlock dateLabel={dateDisplay} timeLabel={timeLabel} compact />
      </div>

      <h2
        className="mb-5 text-[21px] font-bold leading-[30px] text-meeting-text"
        style={{ wordBreak: 'keep-all' }}
        aria-label={`회의 시간 확인 요청, ${dateDisplay} ${timeLabel}`}
      >
        이 시간, 괜찮으세요?
      </h2>

      <div className="mb-5 rounded-[20px] bg-meeting-panel p-5">
        <p className="mb-2 text-[16px] font-medium leading-6 text-meeting-text">
          {conflictLabel}과 겹쳐요.
        </p>
        <p className="text-[14px] leading-[21px] text-meeting-text-secondary">
          일정 내용과 응답 사유는 공개되지 않아요.
        </p>
        <p className="mt-3 text-[13px] leading-5 text-meeting-text-tertiary">
          응답하면 다른 참석자 일정과 다시 확인할게요.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3 pb-2">
        <button
          type="button"
          className={choiceButtonClass}
          disabled={loading}
          onClick={onApprove}
        >
          {loading ? '전달하는 중' : '이 시간 사용 가능'}
        </button>
        <button
          type="button"
          className={choiceButtonClass}
          disabled={loading}
          onClick={onReject}
        >
          이 시간은 어려워요
        </button>
      </div>
    </div>
  )
}
