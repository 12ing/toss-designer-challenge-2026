import type { StatusLabel } from '@/features/meeting-decision/view-model/decision-surface.mapper'

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

type ImpactStatusProps = {
  statusLabel: StatusLabel
  className?: string
}

/** Shared status grammar: dot + text (never a capsule). */
export function ImpactStatus({ statusLabel, className = '' }: ImpactStatusProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 text-[13px] font-semibold leading-5',
        STATUS_TEXT[statusLabel],
        className,
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
