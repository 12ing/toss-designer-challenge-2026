import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import type { MeetingRecommendation } from '@/features/meeting-decision/engine/decision-engine.types'
import { DecisionPreview } from '@/review/components/DecisionPreview'

const STATUS_LABEL: Record<string, string> = {
  READY: '바로 확정 가능',
  NEED_CONFIRMATION: '확인 필요',
  NO_OPTION: '조건 변경 필요',
}

type LabResultPreviewProps = {
  recommendation: MeetingRecommendation
  onOpenProductFlow: () => void
  onApproveSimulation?: () => void
  onDeclineSimulation?: () => void
}

export function LabResultPreview({
  recommendation,
  onOpenProductFlow,
  onApproveSimulation,
  onDeclineSimulation,
}: LabResultPreviewProps) {
  const statusLabel = STATUS_LABEL[recommendation.status] ?? recommendation.status
  const confirmationTarget =
    recommendation.status === 'NEED_CONFIRMATION'
      ? recommendation.confirmationTargets[0]
      : undefined
  const canSimulate =
    Boolean(confirmationTarget) &&
    Boolean(onApproveSimulation) &&
    Boolean(onDeclineSimulation)

  const summary = useMemo(() => {
    if (recommendation.status === 'NO_OPTION') {
      return {
        time: null as string | null,
        required: null as string | null,
        optional: null as string | null,
      }
    }
    const evaluation = recommendation.evaluation
    return {
      time: `${evaluation.slot.dateLabel} · ${evaluation.slot.timeLabel}`,
      required: `필수 ${evaluation.requiredAvailableCount}/${evaluation.requiredTotalCount}명`,
      optional: `선택 ${evaluation.optionalAvailableCount}/${evaluation.optionalTotalCount}명`,
    }
  }, [recommendation])

  const liveSummary = [
    statusLabel,
    summary.time,
    summary.required,
    summary.optional,
    confirmationTarget ? `확인 대상 ${confirmationTarget.name}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div id="lab-result" className="min-w-0 w-full scroll-mt-20">
      <div className="mb-5 flex flex-col gap-2" aria-live="polite" aria-atomic="true">
        <p className="text-[13px] font-medium text-meeting-text-tertiary">
          계산된 결과
        </p>
        <p
          className="text-[20px] font-bold leading-7 text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          {statusLabel}
        </p>
        <span className="sr-only">{liveSummary}</span>
        {summary.time ? (
          <p
            className="text-[15px] text-meeting-text-secondary"
            style={{ wordBreak: 'keep-all' }}
          >
            {summary.time}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-meeting-text-secondary">
          {summary.required ? <span>{summary.required}</span> : null}
          {summary.optional ? <span>{summary.optional}</span> : null}
          {confirmationTarget ? (
            <span
              className="font-medium text-meeting-text"
              style={{ wordBreak: 'keep-all' }}
            >
              확인 대상 · {confirmationTarget.name}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mb-5 min-w-0">
        <DecisionPreview
          recommendation={recommendation}
          label=""
          denseRows
        />
      </div>

      {canSimulate && confirmationTarget ? (
        <div className="mb-5 rounded-2xl border border-meeting-divider bg-meeting-panel/40 px-4 py-4">
          <p
            className="mb-3 text-[14px] font-semibold leading-5 text-meeting-text"
            style={{ wordBreak: 'keep-all' }}
          >
            {confirmationTarget.name} 님의 응답 가정하기
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="whitespace-nowrap"
              onClick={onApproveSimulation}
            >
              사용 가능
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="whitespace-nowrap"
              onClick={onDeclineSimulation}
            >
              이 시간은 어려움
            </Button>
          </div>
        </div>
      ) : null}

      <Button type="button" className="whitespace-nowrap" onClick={onOpenProductFlow}>
        이 조건으로 제품 흐름 보기
      </Button>
    </div>
  )
}
