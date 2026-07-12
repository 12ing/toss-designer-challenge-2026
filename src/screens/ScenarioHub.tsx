import { scenarioMeta } from '@/data/scenarios'
import type { ScenarioId } from '@/types/schedule'

interface ScenarioHubProps {
  onSelect: (id: ScenarioId) => void
}

const order: ScenarioId[] = ['ready', 'need-confirmation', 'rejected']

export function ScenarioHub({ onSelect }: ScenarioHubProps) {
  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-6">
      <div>
        <p className="mb-2 text-[12px] font-medium text-meeting-text-tertiary">
          Prototype navigation
        </p>
        <h2 className="text-[24px] font-bold leading-[34px] tracking-tight text-meeting-text">
          어떤 상황을 확인할까요?
        </h2>
      </div>

      <ul className="flex flex-col gap-3">
        {order.map((id) => {
          const meta = scenarioMeta[id]
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                className="w-full rounded-[var(--meeting-radius-card)] bg-meeting-surface px-6 py-5 text-left shadow-[var(--meeting-shadow)] transition-colors hover:bg-meeting-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
              >
                <p className="mb-1 text-[17px] font-semibold text-meeting-text">
                  {meta.title}
                </p>
                <p className="text-[14px] leading-[21px] text-meeting-text-secondary">
                  {meta.description}
                </p>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
