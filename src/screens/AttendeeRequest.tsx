import { DateTimeBlock } from '@/components/DateTimeBlock'
import { Button } from '@/components/ui/Button'

interface AttendeeRequestProps {
  dateDisplay: string
  timeLabel: string
  loading: boolean
  onApprove: () => void
  onReject: () => void
}

export function AttendeeRequest({
  dateDisplay,
  timeLabel,
  loading,
  onApprove,
  onReject,
}: AttendeeRequestProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6">
        <DateTimeBlock dateLabel={dateDisplay} timeLabel={timeLabel} compact />
      </div>

      <h2
        className="mb-5 text-[21px] font-bold leading-[30px] text-meeting-text"
        style={{ wordBreak: 'keep-all' }}
      >
        이 시간, 괜찮으세요?
      </h2>

      <div className="mb-5 rounded-[20px] bg-meeting-panel p-5">
        <p className="mb-2 text-[16px] font-medium leading-6 text-meeting-text">
          개인 보호 시간과 겹쳐요.
        </p>
        <p className="text-[14px] leading-[21px] text-meeting-text-secondary">
          일정 내용과 응답 사유는 공개되지 않아요.
        </p>
        <p className="mt-3 text-[13px] leading-5 text-meeting-text-tertiary">
          응답하면 다른 참석자 일정과 다시 확인할게요.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3 pb-2">
        <Button size="mobile" onClick={onApprove} disabled={loading}>
          {loading ? '전달하는 중' : '이 시간 사용 가능'}
        </Button>
        <Button
          size="mobile"
          variant="secondary"
          onClick={onReject}
          disabled={loading}
          className="!min-h-14"
        >
          이 시간은 어려워요
        </Button>
      </div>
    </div>
  )
}
