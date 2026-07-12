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
    <div className="rounded-[var(--meeting-radius-panel)] bg-meeting-panel p-5 transition-[opacity,transform] duration-[var(--meeting-motion-standard)] ease-[var(--meeting-ease-standard)]">
      <p className="mb-3 text-[15px] font-medium leading-[23px] text-meeting-text">
        {conflictLabel} 1건과 겹쳐요.
      </p>
      <p className="mb-3 text-[13px] leading-5 text-meeting-text-tertiary">
        확인 대상 · {participantName}
      </p>
      <p className="text-[14px] leading-[21px] text-meeting-text-secondary">
        {resultLabel}
      </p>
    </div>
  )
}
