import { ShieldIcon } from '@/components/icons'

type ConfirmationPanelProps = {
  participantName: string
  conflictLabel: string
  resultLabel: string
}

export function ConfirmationPanel({
  participantName,
  conflictLabel,
  resultLabel,
}: ConfirmationPanelProps) {
  return (
    <div className="rounded-[var(--meeting-radius-panel)] bg-meeting-panel p-5">
      <div className="mb-3 flex items-start gap-2">
        <span className="mt-0.5 text-meeting-text-secondary">
          <ShieldIcon />
        </span>
        <p className="text-[15px] font-medium leading-[23px] text-meeting-text">
          {participantName} 님의 {conflictLabel}을
          <br />
          사용할 수 있는지 확인해야 해요
        </p>
      </div>
      <p className="pl-[26px] text-[14px] leading-[21px] text-meeting-text-secondary">
        {resultLabel}
      </p>
    </div>
  )
}
