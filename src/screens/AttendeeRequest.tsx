import { DateTimeBlock } from '@/components/DateTimeBlock'
import { ATTENDEE_ACTION_COPY } from '@/copy/product.copy'

interface AttendeeRequestProps {
  dateDisplay: string
  timeLabel: string
  meetingTitle?: string
  organizerName: string
  conflictLabel: string
  loading: boolean
  onApprove: () => void
  onReject: () => void
}

const choiceButtonClass =
  'inline-flex w-full min-h-14 items-center justify-center rounded-[var(--meeting-radius-button)] border border-meeting-divider bg-meeting-surface px-5 text-[16px] font-semibold leading-6 text-meeting-text transition-[background-color,color] duration-[var(--meeting-motion-quick)] ease-[var(--meeting-ease-standard)] hover:bg-meeting-primary-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)] disabled:opacity-50'

function isRealMeetingTitle(title?: string) {
  return Boolean(title?.trim())
}

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
  const showMeetingTitle = isRealMeetingTitle(meetingTitle)

  return (
    <div className="flex flex-1 flex-col">
      <h2
        data-page-heading
        tabIndex={-1}
        className="mb-3 text-[21px] font-bold leading-[30px] text-meeting-text outline-none"
        style={{ wordBreak: 'keep-all' }}
        aria-label={`회의 시간 확인 요청, ${dateDisplay} ${timeLabel}`}
      >
        이 시간, 괜찮으세요?
      </h2>

      <p
        className="mb-5 text-[15px] leading-[23px] text-meeting-text-secondary"
        style={{ wordBreak: 'keep-all' }}
      >
        {organizerName} 님이 회의 참석 가능 여부를 물었어요.
      </p>

      {showMeetingTitle ? (
        <p className="mb-4 text-[14px] font-medium leading-[21px] text-meeting-text">
          {meetingTitle}
        </p>
      ) : null}

      <div className="mb-5">
        <DateTimeBlock dateLabel={dateDisplay} timeLabel={timeLabel} compact />
      </div>

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

      <div className="mt-auto flex flex-col gap-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          className={choiceButtonClass}
          disabled={loading}
          aria-busy={loading || undefined}
          onClick={onApprove}
        >
          {loading ? '전달하는 중' : ATTENDEE_ACTION_COPY.approve}
        </button>
        <button
          type="button"
          className={choiceButtonClass}
          disabled={loading}
          onClick={onReject}
        >
          {ATTENDEE_ACTION_COPY.decline}
        </button>
      </div>
    </div>
  )
}
