import type { DecisionCard } from '@/types/decision'

interface DecisionCardPreviewProps {
  decision: DecisionCard
  onSelect?: (id: string) => void
}

const statusLabel: Record<DecisionCard['status'], string> = {
  collapsed: '접힘',
  expanded: '펼침',
  confirming: '확인 중',
  confirmed: '확정',
  dismissed: '무시',
}

export function DecisionCardPreview({
  decision,
  onSelect,
}: DecisionCardPreviewProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(decision.id)}
      className="flex w-full flex-col gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-5 text-left transition hover:border-zinc-300 hover:bg-zinc-50"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-zinc-900">
          {decision.title}
        </h2>
        <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
          {statusLabel[decision.status]}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-500">
        {decision.description}
      </p>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="text-zinc-400">{decision.category}</span>
        <span className="font-medium text-zinc-800">
          {decision.amount.toLocaleString('ko-KR')}원
        </span>
      </div>
    </button>
  )
}
