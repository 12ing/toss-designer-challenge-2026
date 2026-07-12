import { CheckIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'

interface AttendeeResultProps {
  approved: boolean
  onConfirm: () => void
}

export function AttendeeResult({ approved, onConfirm }: AttendeeResultProps) {
  return (
    <div className="flex flex-1 flex-col justify-center py-16">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-meeting-panel text-meeting-text">
        <CheckIcon className="h-6 w-6" />
      </div>

      <h2
        className="mb-3 text-[24px] font-bold leading-[34px] text-meeting-text"
        style={{ wordBreak: 'keep-all' }}
      >
        {approved ? '가능하다고 전달했어요.' : '어렵다고 전달했어요.'}
      </h2>
      <p
        className="mb-10 text-[16px] leading-6 text-meeting-text-secondary"
        style={{ wordBreak: 'keep-all' }}
      >
        {approved ? (
          <>
            회의가 확정되면
            <br />
            캘린더에 반영돼요.
          </>
        ) : (
          '다른 시간을 다시 찾을게요.'
        )}
      </p>
      <Button size="mobile" onClick={onConfirm}>
        확인
      </Button>
    </div>
  )
}
