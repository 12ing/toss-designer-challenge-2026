import { Button } from '@/components/ui/Button'
import { TextButton } from '@/components/ui/TextButton'

interface CompletedProps {
  title: string
  dateDisplay: string
  timeLabel: string
  onComplete: () => void
  onBackToScenarios: () => void
  showDoneMessage?: boolean
}

export function Completed({
  title,
  dateDisplay,
  timeLabel,
  onComplete,
  onBackToScenarios,
  showDoneMessage = false,
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
          <p>꼭 참석해야 하는 4명 모두 초대했어요.</p>
          <p>참석하면 좋은 2명에게도 초대를 보냈어요.</p>
        </div>

        {showDoneMessage ? (
          <p
            className="mb-4 text-[15px] leading-[23px] text-meeting-text-secondary"
            aria-live="polite"
          >
            일정이 확정된 상태로 저장됐어요.
          </p>
        ) : (
          <Button onClick={onComplete}>완료</Button>
        )}

        <div className="mt-4 flex justify-center">
          <TextButton onClick={onBackToScenarios}>시나리오 처음으로</TextButton>
        </div>
      </div>
    </div>
  )
}
