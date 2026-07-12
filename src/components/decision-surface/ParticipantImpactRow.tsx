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

const STATUS_DOT: Record<StatusLabel, string> = {
  가능: 'bg-meeting-positive',
  '확인 필요': 'bg-[color:var(--meeting-primary)]',
  '응답 대기': 'bg-[color:var(--meeting-waiting)]',
  '참석 어려움': 'bg-meeting-text-tertiary',
}

const STATUS_TEXT: Record<StatusLabel, string> = {
  가능: 'text-meeting-text',
  '확인 필요': 'text-meeting-text',
  '응답 대기': 'text-meeting-text-secondary',
  '참석 어려움': 'text-meeting-text-tertiary',
}

function StatusMark({ statusLabel }: { statusLabel: StatusLabel }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 text-[13px] font-semibold leading-5',
        STATUS_TEXT[statusLabel],
      ].join(' ')}
    >
      <span
        aria-hidden
        className={['size-1.5 shrink-0 rounded-full', STATUS_DOT[statusLabel]].join(
          ' ',
        )}
      />
      {statusLabel}
    </span>
  )
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
        <StatusMark statusLabel={statusLabel} />
      </div>
    </div>
  )
}
