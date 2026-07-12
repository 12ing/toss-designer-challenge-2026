import { Button } from '@/components/ui/Button'

interface CompletedProps {
  title: string
  dateDisplay: string
  timeLabel: string
  onComplete: () => void
}

export function Completed({
  title,
  dateDisplay,
  timeLabel,
  onComplete,
}: CompletedProps) {
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="rounded-[var(--meeting-radius-card)] bg-meeting-surface p-8 shadow-[var(--meeting-shadow)]">
        <h2 className="mb-6 text-[22px] font-bold leading-8 text-meeting-text">
          회의 시간을 확정했어요.
        </h2>

        <div className="mb-6 flex flex-col gap-1.5">
          <p className="text-[17px] font-semibold text-meeting-text">{title}</p>
          <p className="text-[15px] text-meeting-text-secondary">{dateDisplay}</p>
          <p className="text-[20px] font-bold text-meeting-text">{timeLabel}</p>
        </div>

        <div className="mb-8 flex flex-col gap-1.5 text-[15px] leading-[23px] text-meeting-text-secondary">
          <p>필수 참석자 4명 모두 초대했어요.</p>
          <p>선택 참석자 2명에게도 초대를 보냈어요.</p>
        </div>

        <Button onClick={onComplete}>완료</Button>
      </div>
    </div>
  )
}
