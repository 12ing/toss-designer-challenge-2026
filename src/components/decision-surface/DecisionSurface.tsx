import { useEffect } from 'react'
import { CheckIcon, ClockIcon, ShieldIcon } from '@/components/icons'
import { PeopleImpactPanel } from '@/components/decision-surface/PeopleImpactPanel'
import { RecommendationReasons } from '@/components/decision-surface/RecommendationReasons'
import { Button } from '@/components/ui/Button'
import type { MeetingRecommendation } from '@/features/meeting-decision/engine/decision-engine.types'
import {
  mapRecommendationToDecisionSurface,
  type DecisionSurfaceMode,
} from '@/features/meeting-decision/view-model/decision-surface.mapper'

export type DecisionSurfaceProps = {
  mode: DecisionSurfaceMode
  recommendation: MeetingRecommendation
  isReasonExpanded: boolean
  onPrimaryAction?: () => void
  onToggleReason?: () => void
  animateIn?: boolean
  onAnimateInEnd?: () => void
}

function StateIcon({ mode }: { mode: DecisionSurfaceMode }) {
  if (mode === 'ready' || mode === 'ready-after-confirmation') {
    return (
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-meeting-positive-subtle text-meeting-positive">
        <CheckIcon className="h-3 w-3" />
      </span>
    )
  }
  if (mode === 'waiting') {
    return (
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-meeting-panel text-meeting-text-secondary">
        <ClockIcon className="h-3.5 w-3.5" />
      </span>
    )
  }
  if (mode === 'no-option') {
    return null
  }
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-meeting-panel text-meeting-text-secondary">
      <ShieldIcon className="h-3.5 w-3.5" />
    </span>
  )
}

export function DecisionSurface({
  mode,
  recommendation,
  isReasonExpanded,
  onPrimaryAction,
  onToggleReason,
  animateIn = false,
  onAnimateInEnd,
}: DecisionSurfaceProps) {
  const vm = mapRecommendationToDecisionSurface({ mode, recommendation })

  useEffect(() => {
    if (!animateIn || !onAnimateInEnd) return
    const timer = window.setTimeout(onAnimateInEnd, 280)
    return () => window.clearTimeout(timer)
  }, [animateIn, onAnimateInEnd])

  const showReason =
    Boolean(onToggleReason) &&
    vm.reasonRows.length > 0 &&
    mode !== 'waiting' &&
    mode !== 'no-option'

  const decisionColumn = (
    <div className="min-w-0">
      <p className="mb-4 text-[13px] font-medium leading-5 text-meeting-text-tertiary">
        {vm.contextLabel}
      </p>

      {vm.dateLabel && vm.timeLabel ? (
        <div className="mb-5">
          <p className="mb-2 text-[18px] font-semibold leading-[26px] text-meeting-text-secondary max-[719px]:text-[17px] max-[719px]:leading-[25px]">
            {vm.dateLabel}
          </p>
          <p className="text-[38px] font-bold leading-[48px] tracking-tight text-meeting-text max-[719px]:text-[30px] max-[719px]:leading-[40px]">
            {vm.timeLabel}
          </p>
        </div>
      ) : null}

      <div
        className="mb-5 flex items-start gap-2 transition-opacity duration-[var(--meeting-motion-quick)]"
        aria-live="polite"
      >
        <StateIcon mode={mode} />
        <p
          className="text-[17px] font-semibold leading-[26px] text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          {vm.stateLabel}
        </p>
      </div>

      {vm.summaryLines.length > 0 ? (
        <div className="mb-5 flex flex-col gap-1.5">
          {vm.summaryLines.map((line) => (
            <p
              key={line}
              className="text-[16px] font-semibold leading-6 text-meeting-text"
            >
              {line}
            </p>
          ))}
        </div>
      ) : null}

      {vm.confirmationLine ? (
        <p className="mb-5 text-[15px] font-medium leading-[23px] text-meeting-text">
          {vm.confirmationLine}
        </p>
      ) : null}

      {vm.supportingLabel ? (
        <p className="mb-5 text-[15px] leading-[23px] text-meeting-text-secondary">
          {vm.supportingLabel}
        </p>
      ) : null}

      {vm.primaryAction && onPrimaryAction ? (
        <div className="mb-6 transition-opacity duration-[var(--meeting-motion-quick)]">
          <Button onClick={onPrimaryAction}>{vm.primaryAction.label}</Button>
        </div>
      ) : null}

      {/* Mobile: people panel between CTA and reason */}
      <div className="mb-6 border-t border-meeting-divider pt-6 min-[720px]:hidden">
        <PeopleImpactPanel
          title={vm.peoplePanelTitle}
          rows={vm.participantRows}
          blockingRows={vm.blockingRows}
          mobileSummary={vm.mobilePeopleSummary}
          collapsibleOnMobile={mode !== 'no-option'}
        />
      </div>

      {showReason && onToggleReason ? (
        <RecommendationReasons
          open={isReasonExpanded}
          onToggle={onToggleReason}
          closedLabel={vm.reasonClosedLabel}
          rows={vm.reasonRows}
          note={vm.reasonNote}
        />
      ) : null}
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-[880px]">
      <article
        className={[
          'w-full rounded-3xl border border-meeting-divider bg-meeting-surface p-8 shadow-[0_12px_32px_rgba(0,27,55,0.06)]',
          animateIn
            ? 'animate-[card-in_var(--meeting-motion-standard)_var(--meeting-ease-standard)] motion-reduce:animate-none'
            : '',
        ].join(' ')}
      >
        <div className="grid grid-cols-1 gap-8 min-[720px]:grid-cols-[minmax(0,1fr)_320px] min-[720px]:gap-8">
          {decisionColumn}

          <div className="hidden border-l border-meeting-divider pl-8 min-[720px]:block">
            <PeopleImpactPanel
              title={vm.peoplePanelTitle}
              rows={vm.participantRows}
              blockingRows={vm.blockingRows}
              mobileSummary={vm.mobilePeopleSummary}
              collapsibleOnMobile={false}
            />
          </div>
        </div>
      </article>
    </div>
  )
}
