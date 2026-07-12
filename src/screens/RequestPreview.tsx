import { Button } from '@/components/ui/Button'
import { TextButton } from '@/components/ui/TextButton'

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
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="rounded-[var(--meeting-radius-card)] bg-meeting-surface p-8 shadow-[var(--meeting-shadow)]">
        <h2 className="mb-6 text-[20px] font-semibold leading-7 text-meeting-text">
          이렇게 확인할게요.
        </h2>

        <p className="mb-4 text-[15px] text-meeting-text-secondary">
          받는 사람{' '}
          <span className="font-semibold text-meeting-text">
            {recipientName} 님
          </span>
        </p>

        <div className="mb-5 rounded-[var(--meeting-radius-panel)] bg-meeting-panel px-4 py-4 text-[15px] leading-[23px] text-meeting-text">
          <p>
            {dateDisplay} {timeLabel}에
            <br />
            회의 참석이 가능한지 확인해주세요.
          </p>
        </div>

        <p className="mb-8 text-[14px] leading-[21px] text-meeting-text-tertiary">
          개인 일정의 상세 내용과 응답 사유는 공유되지 않아요.
        </p>

        <Button onClick={onSend} loading={loading}>
          요청 보내기
        </Button>
        <div className="mt-4 flex justify-center">
          <TextButton onClick={onBack} disabled={loading}>
            돌아가기
          </TextButton>
        </div>
      </div>
    </div>
  )
}
