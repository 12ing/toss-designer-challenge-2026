import { DateTimeBlock } from '@/components/DateTimeBlock'
import { ShieldIcon } from '@/components/icons'
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
        <DateTimeBlock
          dateLabel={dateDisplay}
          timeLabel={timeLabel}
          compact
        />
      </div>

      <div className="mb-8 rounded-[20px] bg-meeting-panel p-5">
        <div className="mb-3 flex items-start gap-2">
          <span className="mt-0.5 text-meeting-text-secondary">
            <ShieldIcon />
          </span>
          <p className="text-[16px] font-medium leading-6 text-meeting-text">
            개인 보호 시간과 겹쳐요
          </p>
        </div>
        <p className="pl-[26px] text-[14px] leading-[21px] text-meeting-text-tertiary">
          응답 사유와 일정 내용은
          <br />
          다른 사람에게 공개되지 않아요
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
