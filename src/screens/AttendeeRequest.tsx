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
      <h2 className="mb-6 text-[24px] font-bold leading-[34px] text-meeting-text">
        이 시간에 회의가 가능한지 확인해주세요
      </h2>

      <div className="mb-5">
        <DateTimeBlock dateLabel={dateDisplay} timeLabel={timeLabel} compact />
      </div>

      <div className="mb-5 rounded-[20px] bg-meeting-panel p-5">
        <p className="mb-2 text-[16px] font-medium leading-6 text-meeting-text">
          개인 보호 시간과 겹쳐요
        </p>
        <p className="text-[14px] leading-[21px] text-meeting-text-secondary">
          이 시간을 사용할 수 있는지 알려주면 다른 참석자의 일정과 함께 다시
          확인할게요.
        </p>
        <p className="mt-3 text-[14px] leading-[21px] text-meeting-text-tertiary">
          응답 사유와 일정 내용은 다른 사람에게 공개되지 않아요
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
        >
          이 시간은 어려워요
        </Button>
      </div>
    </div>
  )
}
