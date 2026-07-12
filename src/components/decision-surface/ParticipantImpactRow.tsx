import type { ImpactTone } from '@/features/meeting-decision/view-model/decision-surface.mapper'

type ParticipantImpactRowProps = {
  name: string
  roleLabel: '필수' | '선택'
  statusLabel: string
  contextLabel?: string
  tone: ImpactTone
}

export function ParticipantImpactRow({
  name,
  roleLabel,
  statusLabel,
  contextLabel,
  tone,
}: ParticipantImpactRowProps) {
  const statusClass =
    tone === 'attention'
      ? 'text-meeting-text'
      : tone === 'positive'
        ? 'text-meeting-text'
        : 'text-meeting-text-secondary'

  return (
    <div className="flex min-h-[52px] items-start justify-between gap-3 border-b border-meeting-divider py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold leading-[22px] text-meeting-text">
          {name}
          <span className="ml-1.5 font-normal text-meeting-text-tertiary">
            · {roleLabel}
          </span>
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
          statusClass,
        ].join(' ')}
      >
        {statusLabel}
      </p>
    </div>
  )
}
