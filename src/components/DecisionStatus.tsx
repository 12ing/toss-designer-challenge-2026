import { CheckIcon, ClockIcon, ShieldIcon } from '@/components/icons'
import type { DecisionCardState } from '@/types/schedule'

type DecisionStatusProps = {
  state: DecisionCardState
  title: string | string[]
}

function StatusIcon({ state }: { state: DecisionCardState }) {
  if (state === 'ready' || state === 'ready-after-confirmation') {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-meeting-positive-subtle text-meeting-positive">
        <CheckIcon className="h-3.5 w-3.5" />
      </span>
    )
  }

  if (state === 'waiting') {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-meeting-panel text-meeting-text-secondary">
        <ClockIcon />
      </span>
    )
  }

  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-meeting-primary-subtle text-meeting-primary">
      <ShieldIcon />
    </span>
  )
}

export function DecisionStatus({ state, title }: DecisionStatusProps) {
  const lines = Array.isArray(title) ? title : [title]

  return (
    <div className="flex gap-3">
      <div className="pt-1">
        <StatusIcon state={state} />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        {lines.map((line) => (
          <h2
            key={line}
            className="text-[24px] font-bold leading-[34px] tracking-tight text-meeting-text"
          >
            {line}
          </h2>
        ))}
      </div>
    </div>
  )
}
