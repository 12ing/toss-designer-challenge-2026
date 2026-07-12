import { Button } from '@/components/ui/Button'

interface AttendeeResultProps {
  approved: boolean
  onConfirm: () => void
}

export function AttendeeResult({ approved, onConfirm }: AttendeeResultProps) {
  return (
    <div className="flex flex-1 flex-col justify-center py-16">
      <h2 className="mb-3 text-[24px] font-bold leading-[34px] text-meeting-text">
        {approved ? '가능하다고 전달했어요.' : '어렵다고 전달했어요.'}
      </h2>
      <p className="mb-10 text-[16px] leading-6 text-meeting-text-secondary">
        {approved
          ? '주최자가 회의를 확정하면 캘린더에 반영할게요.'
          : '다른 시간을 다시 찾을게요.'}
      </p>
      <Button size="mobile" onClick={onConfirm}>
        확인
      </Button>
    </div>
  )
}
