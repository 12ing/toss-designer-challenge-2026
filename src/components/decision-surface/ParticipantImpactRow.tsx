import { ImpactStatus } from '@/components/decision-surface/ImpactStatus'
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

export function ParticipantImpactRow({
  name,
  statusLabel,
  contextLabel,
  accessibleLabel,
}: ParticipantImpactRowProps) {
  return (
    <div
      className="flex min-h-[52px] items-start justify-between gap-3 border-b border-meeting-divider bg-transparent py-3 last:border-b-0"
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
      <div className="shrink-0 transition-opacity duration-[var(--meeting-motion-quick)]">
        <ImpactStatus statusLabel={statusLabel} />
      </div>
    </div>
  )
}
