import { scenarioMeta } from '@/data/scenarios'
import type { ScenarioId } from '@/types/schedule'

interface ScenarioHubProps {
  onSelect: (id: ScenarioId) => void
}

const order: ScenarioId[] = ['ready', 'need-confirmation', 'rejected']

export function ScenarioHub({ onSelect }: ScenarioHubProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-[12px] font-medium text-grey-500">
          Prototype navigation
        </p>
        <h2 className="text-[24px] font-bold leading-8 tracking-tight text-grey-900">
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
                className="w-full rounded-[20px] bg-background px-6 py-5 text-left transition-colors hover:bg-grey-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                <p className="mb-1 text-[17px] font-semibold text-grey-900">
                  {meta.title}
                </p>
                <p className="text-[14px] leading-[22px] text-grey-600">
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
