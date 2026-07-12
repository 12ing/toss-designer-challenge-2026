import { ImpactStatus } from '@/components/decision-surface/ImpactStatus'
import type { MeetingRecommendation } from '@/features/meeting-decision/engine/decision-engine.types'
import { surfaceFromRecommendation } from '@/features/meeting-decision/mappers/to-ui'
import {
  mapRecommendationToDecisionSurface,
  type ParticipantImpactViewModel,
} from '@/features/meeting-decision/view-model/decision-surface.mapper'

type DecisionPreviewProps = {
  recommendation: MeetingRecommendation
  label?: string
  className?: string
}

function PreviewPersonRow({ row }: { row: ParticipantImpactViewModel }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p
          className="text-[14px] font-semibold leading-5 text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          {row.name}
        </p>
        {row.contextLabel ? (
          <p
            className="mt-0.5 text-[12px] leading-4 text-meeting-text-tertiary"
            style={{ wordBreak: 'keep-all' }}
          >
            {row.contextLabel}
          </p>
        ) : null}
      </div>
      <ImpactStatus statusLabel={row.statusLabel} className="shrink-0" />
    </div>
  )
}

/**
 * Review/Lab preview — reuses Decision Surface view-model,
 * without product CTA, reasons, or cramped dual-column chrome.
 */
export function DecisionPreview({
  recommendation,
  label = '핵심 경험 미리보기',
  className = '',
}: DecisionPreviewProps) {
  const mode = surfaceFromRecommendation(recommendation)
  const vm = mapRecommendationToDecisionSurface({ mode, recommendation })

  return (
    <aside
      className={['min-w-0 w-full', className].join(' ')}
      aria-label={label}
    >
      {label ? (
        <p className="mb-3 text-[13px] font-medium leading-5 text-meeting-text-tertiary">
          {label}
        </p>
      ) : null}

      <div className="w-full min-w-0 rounded-[24px] border border-meeting-divider bg-meeting-surface p-5 shadow-[0_12px_28px_rgba(0,27,55,0.06)] @container/preview sm:p-6">
        <p className="mb-3 text-[12px] font-medium text-meeting-text-tertiary">
          {vm.contextLabel}
        </p>

        {vm.dateLabel && vm.timeLabel ? (
          <div className="mb-4 min-w-0">
            <p
              className="mb-1 text-[15px] font-semibold leading-6 text-meeting-text-secondary"
              style={{ wordBreak: 'keep-all' }}
            >
              {vm.dateLabel}
            </p>
            <p
              className="text-[28px] font-bold leading-9 tracking-tight text-meeting-text max-[379px]:text-[24px] max-[379px]:leading-8"
              style={{ wordBreak: 'keep-all' }}
            >
              {vm.timeLabel}
            </p>
          </div>
        ) : null}

        <p
          className="mb-3 text-[16px] font-semibold leading-6 text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          {vm.stateLabel}
        </p>

        {vm.supportingLabel ? (
          <p
            className="mb-4 text-[14px] leading-[21px] text-meeting-text-secondary"
            style={{ wordBreak: 'keep-all' }}
          >
            {vm.supportingLabel}
          </p>
        ) : null}

        {vm.confirmationTarget ? (
          <div className="mb-5">
            <p
              className="text-[13px] leading-5 text-meeting-text-tertiary"
              style={{ wordBreak: 'keep-all' }}
            >
              확인 대상 · {vm.confirmationTarget.name}
            </p>
            <p
              className="text-[14px] font-medium leading-[21px] text-meeting-text"
              style={{ wordBreak: 'keep-all' }}
            >
              {vm.confirmationTarget.contextLabel}
            </p>
          </div>
        ) : null}

        {vm.blockingRows && vm.blockingRows.length > 0 ? (
          <ul className="flex flex-col gap-2 border-t border-meeting-divider pt-4">
            {vm.blockingRows.map((row) => (
              <li
                key={row.label}
                className="text-[14px] leading-[21px] text-meeting-text-secondary"
                style={{ wordBreak: 'keep-all' }}
              >
                {row.label}
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-t border-meeting-divider pt-4">
            {vm.requiredRows.length > 0 ? (
              <section className="mb-4">
                <h3 className="mb-1 text-[12px] font-bold text-meeting-text-secondary">
                  필수 참석자 {vm.requiredRows.length}명
                </h3>
                <div className="divide-y divide-meeting-divider">
                  {vm.requiredRows.map((row) => (
                    <PreviewPersonRow key={row.participantId} row={row} />
                  ))}
                </div>
              </section>
            ) : null}
            {vm.optionalRows.length > 0 ? (
              <section>
                <h3 className="mb-1 text-[12px] font-bold text-meeting-text-secondary">
                  선택 참석자 {vm.optionalRows.length}명
                </h3>
                <div className="divide-y divide-meeting-divider">
                  {vm.optionalRows.map((row) => (
                    <PreviewPersonRow key={row.participantId} row={row} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  )
}
