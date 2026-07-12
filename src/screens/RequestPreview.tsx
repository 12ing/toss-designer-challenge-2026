import { Button } from '@/components/ui/Button'
import { TextButton } from '@/components/ui/TextButton'
import { productCopy } from '@/copy/product.copy'

interface RequestPreviewProps {
  recipientName: string
  dateDisplay: string
  timeLabel: string
  loading: boolean
  onSend: () => void
  onBack: () => void
}

export function RequestPreview({
  recipientName,
  dateDisplay,
  timeLabel,
  loading,
  onSend,
  onBack,
}: RequestPreviewProps) {
  const copy = productCopy.requestPreview
  const [bodyLine1, bodyLine2] = copy
    .body(dateDisplay, timeLabel)
    .split('\n')

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="rounded-[var(--meeting-radius-card)] bg-meeting-surface p-8 shadow-[var(--meeting-shadow)]">
        <h2 className="mb-6 text-[20px] font-semibold leading-7 text-meeting-text">
          {copy.title(recipientName)}
        </h2>

        <div className="mb-5 rounded-[var(--meeting-radius-panel)] bg-meeting-panel px-4 py-4 text-[15px] leading-[23px] text-meeting-text">
          <p>
            {bodyLine1}
            <br />
            {bodyLine2}
          </p>
        </div>

        <p className="mb-8 text-[14px] leading-[21px] text-meeting-text-tertiary">
          {copy.privacy.split('\n').map((line, i, arr) => (
            <span key={line}>
              {line}
              {i < arr.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>

        <Button onClick={onSend} loading={loading}>
          {copy.primaryAction}
        </Button>
        <div className="mt-4 flex justify-center">
          <TextButton onClick={onBack} disabled={loading}>
            {copy.secondaryAction}
          </TextButton>
        </div>
      </div>
    </div>
  )
}
