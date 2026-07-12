import { useMemo } from 'react'
import { DecisionSurface } from '@/components/decision-surface/DecisionSurface'
import { Button } from '@/components/ui/Button'
import type { MeetingRecommendation } from '@/features/meeting-decision/engine/decision-engine.types'
import { surfaceFromRecommendation } from '@/features/meeting-decision/mappers/to-ui'

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
  const mode = surfaceFromRecommendation(recommendation)
  const statusLabel = STATUS_LABEL[recommendation.status] ?? recommendation.status
  const canSimulate =
    recommendation.status === 'NEED_CONFIRMATION' &&
    Boolean(onApproveSimulation) &&
    Boolean(onDeclineSimulation)

  const summary = useMemo(() => {
    if (recommendation.status === 'NO_OPTION') {
      return {
        time: null as string | null,
        required: null as string | null,
        optional: null as string | null,
        target: null as string | null,
      }
    }
    const evaluation = recommendation.evaluation
    const target =
      recommendation.status === 'NEED_CONFIRMATION'
        ? recommendation.confirmationTargets[0]
        : undefined
    return {
      time: `${evaluation.slot.dateLabel} · ${evaluation.slot.timeLabel}`,
      required: `필수 ${evaluation.requiredAvailableCount}/${evaluation.requiredTotalCount}명`,
      optional: `선택 ${evaluation.optionalAvailableCount}/${evaluation.optionalTotalCount}명`,
      target: target ? `확인 대상 · ${target.name}` : null,
    }
  }, [recommendation])

  return (
    <div className="min-w-0">
      <div className="mb-5 flex flex-col gap-2">
        <p className="text-[13px] font-medium text-meeting-text-tertiary">
          계산된 결과
        </p>
        <p className="text-[20px] font-bold leading-7 text-meeting-text">
          {statusLabel}
        </p>
        {summary.time ? (
          <p className="text-[15px] text-meeting-text-secondary">{summary.time}</p>
        ) : null}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-meeting-text-secondary">
          {summary.required ? <span>{summary.required}</span> : null}
          {summary.optional ? <span>{summary.optional}</span> : null}
          {summary.target ? (
            <span className="font-medium text-meeting-text">{summary.target}</span>
          ) : null}
        </div>
      </div>

      <div className="mb-5 overflow-hidden rounded-[28px] border border-meeting-divider bg-meeting-panel/30 p-2">
        <DecisionSurface
          mode={mode}
          recommendation={recommendation}
          isReasonExpanded
        />
      </div>

      {canSimulate ? (
        <div className="mb-5 flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={onApproveSimulation}>
            사용 가능으로 응답
          </Button>
          <Button variant="secondary" onClick={onDeclineSimulation}>
            어려움으로 응답
          </Button>
        </div>
      ) : null}

      <Button onClick={onOpenProductFlow}>이 조건으로 제품 흐름 보기</Button>
    </div>
  )
}
