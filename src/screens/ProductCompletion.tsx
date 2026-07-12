import { Button } from '@/components/ui/Button'

interface ProductCompletionProps {
  title: string
  dateDisplay: string
  timeLabel: string
  requiredCount: number
  optionalCount: number
  location?: string
  onComplete: () => void
}

/** Product-facing meeting created screen — separate from ReviewCompletion. */
export function ProductCompletion({
  title,
  dateDisplay,
  timeLabel,
  requiredCount,
  optionalCount,
  location,
  onComplete,
}: ProductCompletionProps) {
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="rounded-[var(--meeting-radius-card)] bg-meeting-surface p-8 shadow-[var(--meeting-shadow)]">
        <h2
          data-page-heading
          tabIndex={-1}
          className="mb-6 text-[22px] font-bold leading-8 text-meeting-text outline-none"
          style={{ wordBreak: 'keep-all' }}
        >
          회의를 만들었어요.
        </h2>

        <div className="mb-6 flex flex-col gap-1.5">
          <p className="text-[15px] text-meeting-text-secondary">{dateDisplay}</p>
          <p className="text-[20px] font-bold text-meeting-text">{timeLabel}</p>
          <p className="mt-1 text-[17px] font-semibold text-meeting-text">
            {title}
          </p>
          {location ? (
            <p className="text-[15px] text-meeting-text-secondary">{location}</p>
          ) : null}
        </div>

        <div className="mb-8 flex flex-col gap-1 text-[15px] leading-[23px] text-meeting-text-secondary">
          <p>필수 참석자 {requiredCount}명</p>
          <p>선택 참석자 {optionalCount}명</p>
        </div>

        <Button type="button" onClick={onComplete}>
          완료
        </Button>
      </div>
    </div>
  )
}
