import { CheckIcon, ClockIcon, ShieldIcon } from '@/components/icons'
import type { DecisionCardState } from '@/types/schedule'

type DecisionStatusProps = {
  state: DecisionCardState
  title: string | string[]
}

function StatusIcon({ state }: { state: DecisionCardState }) {
  if (state === 'ready' || state === 'ready-after-confirmation') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-meeting-positive-subtle text-meeting-positive">
        <CheckIcon className="h-3 w-3" />
      </span>
    )
  }

  if (state === 'waiting') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-meeting-panel text-meeting-text-tertiary">
        <ClockIcon className="h-3.5 w-3.5" />
      </span>
    )
  }

  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-meeting-panel text-meeting-text-tertiary">
      <ShieldIcon className="h-3.5 w-3.5" />
    </span>
  )
}

export function DecisionStatus({ state, title }: DecisionStatusProps) {
  const lines = Array.isArray(title) ? title : [title]

  return (
    <div className="flex items-start gap-2 transition-opacity duration-[var(--meeting-motion-standard)] ease-[var(--meeting-ease-standard)]">
      <div className="pt-0.5">
        <StatusIcon state={state} />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        {lines.map((line) => (
          <p
            key={line}
            className="text-[16px] font-medium leading-6 text-meeting-text-secondary"
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
