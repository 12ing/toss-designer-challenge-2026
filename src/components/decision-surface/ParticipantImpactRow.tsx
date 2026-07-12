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

function StatusMark({ statusLabel }: { statusLabel: StatusLabel }) {
  if (statusLabel === '가능') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold leading-5 text-meeting-text">
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-full bg-meeting-positive"
        />
        가능
      </span>
    )
  }

  if (statusLabel === '확인 필요') {
    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-[13px] font-semibold leading-5 text-[color:var(--meeting-primary)]"
        style={{
          border:
            '1px solid color-mix(in srgb, var(--meeting-primary) 28%, transparent)',
        }}
      >
        확인 필요
      </span>
    )
  }

  if (statusLabel === '응답 대기') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold leading-5 text-meeting-text-secondary">
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: 'var(--meeting-waiting)' }}
        />
        응답 대기
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold leading-5 text-meeting-text-tertiary">
      <span
        aria-hidden
        className="size-1.5 shrink-0 rounded-full bg-meeting-text-tertiary"
      />
      참석 어려움
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
