import { Button } from '@/components/ui/Button'

interface AttendeeRequestProps {
  dateDisplay: string
  timeLabel: string
  conflictType: string
  loading: boolean
  onApprove: () => void
  onReject: () => void
}

export function AttendeeRequest({
  dateDisplay,
  timeLabel,
  conflictType,
  loading,
  onApprove,
  onReject,
}: AttendeeRequestProps) {
  return (
    <div className="flex flex-1 flex-col">
      <h2 className="mb-6 text-[22px] font-bold leading-8 text-grey-900">
        이 시간에 회의가 가능한지 확인해주세요.
      </h2>

      <div className="mb-5">
        <p className="mb-1.5 text-[15px] text-grey-600">{dateDisplay}</p>
        <p className="text-[26px] font-bold leading-9 text-grey-900">
          {timeLabel}
        </p>
      </div>

      <p className="mb-3 text-[15px] font-medium leading-6 text-grey-800">
        보호한 {conflictType}과 겹쳐요.
      </p>
      <p className="mb-5 text-[15px] leading-6 text-grey-600">
        이 시간을 사용할 수 있는지 알려주면 다른 참석자의 일정과 함께 다시
        확인할게요.
      </p>
      <p className="mb-8 text-[14px] leading-[22px] text-grey-500">
        응답 사유와 개인 일정 내용은 다른 참석자에게 공개되지 않아요.
      </p>

      <div className="mt-auto flex flex-col gap-3">
        <Button onClick={onApprove} disabled={loading}>
          {loading ? '전달하는 중' : '이 시간 사용 가능'}
        </Button>
        <Button variant="secondary" onClick={onReject} disabled={loading}>
          이 시간은 어려워요
        </Button>
      </div>
    </div>
  )
}
