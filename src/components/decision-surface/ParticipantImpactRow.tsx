import type {
  ImpactTone,
  StatusLabel,
} from '@/features/meeting-decision/view-model/decision-surface.mapper'

type ParticipantImpactRowProps = {
  name: string
  statusLabel: StatusLabel
  contextLabel?: string
  tone: ImpactTone
  isConfirmationTarget?: boolean
  accessibleLabel: string
}

function statusClass(tone: ImpactTone, statusLabel: StatusLabel) {
  if (statusLabel === '확인 필요' || tone === 'attention') {
    return 'rounded-full bg-meeting-primary-subtle px-2.5 py-1 text-[color:var(--meeting-primary)]'
  }
  if (statusLabel === '응답 대기' || tone === 'waiting') {
    return 'text-meeting-text-secondary'
  }
  if (statusLabel === '참석 어려움') {
    return 'text-meeting-text-secondary'
  }
  // 가능
  return 'text-meeting-text'
}

export function ParticipantImpactRow({
  name,
  statusLabel,
  contextLabel,
  tone,
  isConfirmationTarget = false,
  accessibleLabel,
}: ParticipantImpactRowProps) {
  return (
    <div
      className={[
        'flex min-h-[52px] items-start justify-between gap-3 border-b border-meeting-divider py-3 last:border-b-0',
        isConfirmationTarget
          ? 'rounded-lg bg-meeting-primary-subtle/40 pl-3 -ml-1 border-l-2 border-l-[color:var(--meeting-primary)]'
          : '',
      ].join(' ')}
      aria-label={accessibleLabel}
    >
      <div className="min-w-0">
        <p className="text-[15px] font-semibold leading-[22px] text-meeting-text">
          {name}
        </p>
        {contextLabel ? (
          <p className="mt-0.5 text-[13px] font-normal leading-5 text-meeting-text-tertiary">
            {contextLabel}
          </p>
        ) : null}
      </div>
      <p
        className={[
          'shrink-0 text-[13px] font-semibold leading-5 transition-opacity duration-[var(--meeting-motion-quick)]',
          statusClass(tone, statusLabel),
        ].join(' ')}
      >
        {statusLabel}
      </p>
    </div>
  )
}
