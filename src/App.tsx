import { DecisionCardPreview } from '@/components/DecisionCardPreview'
import { useDecisions } from '@/hooks/useDecisions'

export default function App() {
  const { decisions, isLoading, error } = useDecisions()

  return (
    <div className="min-h-screen bg-zinc-50 px-5 py-10">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-blue-600">Toss 2026 Challenge</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Decision Cards
          </h1>
          <p className="text-sm leading-relaxed text-zinc-500">
            Mock API 레이어로 DecisionCard 상태를 불러오는 베이스 셋업입니다.
          </p>
        </header>

        {isLoading && (
          <p className="text-sm text-zinc-400">불러오는 중…</p>
        )}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!isLoading && !error && (
          <ul className="flex flex-col gap-3">
            {decisions.map((decision) => (
              <li key={decision.id}>
                <DecisionCardPreview decision={decision} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
