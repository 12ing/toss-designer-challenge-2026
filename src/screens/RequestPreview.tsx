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
    <div className="rounded-[20px] bg-background px-7 py-8 sm:px-8">
      <h2 className="mb-6 text-[20px] font-semibold leading-7 text-grey-900">
        이렇게 확인할게요.
      </h2>

      <p className="mb-4 text-[15px] text-grey-600">
        받는 사람{' '}
        <span className="font-semibold text-grey-900">{recipientName} 님</span>
      </p>

      <div className="mb-5 rounded-2xl bg-grey-50 px-4 py-4 text-[15px] leading-6 text-grey-800">
        <p>
          {dateDisplay} {timeLabel}에
          <br />
          회의 참석이 가능한지 확인해주세요.
        </p>
      </div>

      <p className="mb-8 text-[14px] leading-[22px] text-grey-500">
        개인 일정의 상세 내용과 응답 사유는
        <br />
        다른 참석자에게 공개되지 않아요.
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
  )
}
