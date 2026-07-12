import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { ATTENDEE_ACTION_COPY, PRODUCT_TERMS } from '@/copy/product.copy'
import type { MeetingRecommendation } from '@/features/meeting-decision/engine/decision-engine.types'
import { DecisionPreview } from '@/review/components/DecisionPreview'

const STATUS_LABEL: Record<string, string> = {
  READY: '바로 확정할 수 있어요',
  NEED_CONFIRMATION: PRODUCT_TERMS.needsConfirmation,
  NO_OPTION: '참석 조건 조정 필요',
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
  const statusLabel =
    STATUS_LABEL[recommendation.status] ?? recommendation.status
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
      required: `${PRODUCT_TERMS.requiredAttendee} ${evaluation.requiredAvailableCount}/${evaluation.requiredTotalCount}명`,
      optional: `${PRODUCT_TERMS.optionalAttendee} ${evaluation.optionalAvailableCount}/${evaluation.optionalTotalCount}명`,
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
    <div
      id="lab-result"
      className="min-w-0 w-full scroll-mt-20 rounded-3xl border border-meeting-divider bg-meeting-surface p-5 shadow-[0_12px_32px_rgba(0,27,55,0.06)] min-[640px]:p-6"
    >
      <div className="mb-5 flex flex-col gap-2">
        <p className="text-[13px] font-medium text-meeting-text-tertiary">
          계산된 결과
        </p>
        <p
          className="text-[20px] font-bold leading-7 text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
          aria-live="polite"
        >
          {statusLabel}
        </p>
        <span className="sr-only">{liveSummary}</span>
        {summary.time ? (
          <p
            className="text-[22px] font-bold leading-8 tracking-tight text-meeting-text"
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
        <DecisionPreview recommendation={recommendation} label="" denseRows />
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
              {ATTENDEE_ACTION_COPY.approve}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="whitespace-nowrap"
              onClick={onDeclineSimulation}
            >
              {ATTENDEE_ACTION_COPY.decline}
            </Button>
          </div>
        </div>
      ) : null}

      <Button
        type="button"
        className="whitespace-nowrap"
        onClick={onOpenProductFlow}
      >
        이 조건으로 제품 흐름 보기
      </Button>
    </div>
  )
}
