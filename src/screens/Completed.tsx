import { Button } from '@/components/ui/Button'
import { TextButton } from '@/components/ui/TextButton'

interface CompletedProps {
  title: string
  dateDisplay: string
  timeLabel: string
  onClose: () => void
}

export function Completed({
  title,
  dateDisplay,
  timeLabel,
  onClose,
}: CompletedProps) {
  return (
    <div className="rounded-[20px] bg-background px-7 py-8 sm:px-8">
      <h2 className="mb-6 text-[22px] font-bold leading-8 text-grey-900">
        회의 시간을 확정했어요.
      </h2>

      <div className="mb-6 flex flex-col gap-1.5">
        <p className="text-[17px] font-semibold text-grey-900">{title}</p>
        <p className="text-[15px] text-grey-600">{dateDisplay}</p>
        <p className="text-[20px] font-bold text-grey-900">{timeLabel}</p>
      </div>

      <div className="mb-8 flex flex-col gap-1.5 text-[15px] leading-6 text-grey-600">
        <p>꼭 참석해야 하는 4명 모두 초대했어요.</p>
        <p>참석하면 좋은 2명에게도 초대를 보냈어요.</p>
      </div>

      <Button onClick={onClose} className="mb-3">
        캘린더에서 보기
      </Button>
      <div className="flex justify-center">
        <TextButton onClick={onClose}>닫기</TextButton>
      </div>
    </div>
  )
}
