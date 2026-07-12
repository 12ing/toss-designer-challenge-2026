import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { CheckIcon, ClockIcon, ShieldIcon } from '@/components/icons'
import { PeopleImpactPanel } from '@/components/decision-surface/PeopleImpactPanel'
import { ReasonPanel } from '@/components/decision-surface/ReasonPanel'
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

type ContextView = 'people' | 'reason'
type MobileSheet = 'people' | 'reason' | null

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

function MobileBottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previouslyFocused.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end min-[720px]:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(0,27,55,0.28)]"
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-meeting-surface px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-8px_32px_rgba(0,27,55,0.12)]"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 id={titleId} className="text-[16px] font-semibold text-meeting-text">
            {title}
          </h3>
          <button
            ref={closeRef}
            type="button"
            className="inline-flex min-h-11 items-center px-2 text-[14px] font-medium text-meeting-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        {children}
      </div>
    </div>
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
  const [contextView, setContextView] = useState<ContextView>('people')
  const [mobileSheet, setMobileSheet] = useState<MobileSheet>(null)
  const reasonTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!animateIn || !onAnimateInEnd) return
    const timer = window.setTimeout(onAnimateInEnd, 280)
    return () => window.clearTimeout(timer)
  }, [animateIn, onAnimateInEnd])

  useEffect(() => {
    setContextView(isReasonExpanded ? 'reason' : 'people')
  }, [isReasonExpanded])

  useEffect(() => {
    setContextView('people')
    setMobileSheet(null)
  }, [mode, recommendation])

  const canShowReason =
    Boolean(onToggleReason) &&
    vm.reasonRows.length > 0 &&
    mode !== 'waiting' &&
    mode !== 'no-option'

  const openReason = () => {
    setContextView('reason')
    if (!isReasonExpanded) onToggleReason?.()
  }

  const openPeople = () => {
    setContextView('people')
    if (isReasonExpanded) onToggleReason?.()
  }

  const peoplePanel = (
    <PeopleImpactPanel
      title={vm.peoplePanelTitle}
      requiredRows={vm.requiredRows}
      optionalRows={vm.optionalRows}
      blockingRows={vm.blockingRows}
      mobileSummary={vm.mobilePeopleSummary}
      mobileConfirmationHint={vm.mobileConfirmationHint}
      collapsibleOnMobile={false}
      forceExpanded
    />
  )

  const reasonPanel = (
    <ReasonPanel
      rows={vm.reasonRows}
      note={vm.reasonNote}
      onShowPeople={openPeople}
    />
  )

  const decisionColumn = (
    <div className="min-w-0">
      <p className="mb-2.5 text-[13px] font-medium leading-5 text-meeting-text-tertiary">
        {vm.contextLabel}
      </p>

      {vm.dateLabel && vm.timeLabel ? (
        <div className="mb-3.5">
          <p className="mb-1 text-[17px] font-semibold leading-[25px] text-meeting-text-secondary">
            {vm.dateLabel}
          </p>
          <p className="text-[32px] font-bold leading-[42px] tracking-tight text-meeting-text max-[719px]:text-[30px] max-[719px]:leading-[40px]">
            {vm.timeLabel}
          </p>
        </div>
      ) : null}

      <div className="mb-3.5 flex items-start gap-2" aria-live="polite">
        <StateIcon mode={mode} />
        <p
          className="text-[17px] font-semibold leading-[26px] text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          {vm.stateLabel}
        </p>
      </div>

      {vm.summaryLines.length > 0 ? (
        <div className="mb-3.5 flex flex-col gap-1">
          {vm.summaryLines.map((line) => (
            <p
              key={line}
              className="text-[15px] font-semibold leading-[23px] text-meeting-text"
            >
              {line}
            </p>
          ))}
        </div>
      ) : null}

      {vm.confirmationLine ? (
        <p className="mb-2.5 text-[15px] font-medium leading-[23px] text-meeting-text">
          {vm.confirmationLine}
        </p>
      ) : null}

      {vm.supportingLabel ? (
        <p className="mb-3.5 text-[15px] leading-[23px] text-meeting-text-secondary">
          {vm.supportingLabel}
        </p>
      ) : null}

      {vm.primaryAction && onPrimaryAction ? (
        <div className="mb-3.5">
          {vm.confirmationTarget &&
          (mode === 'need-confirmation' || mode === 'next-alternative') ? (
            <div className="mb-2.5">
              <p className="text-[13px] leading-5 text-meeting-text-tertiary">
                확인 대상 · {vm.confirmationTarget.name}
              </p>
              <p className="text-[14px] font-medium leading-[21px] text-meeting-text">
                {vm.confirmationTarget.contextLabel}
              </p>
            </div>
          ) : null}
          <Button type="button" onClick={onPrimaryAction}>
            {vm.primaryAction.label}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-x-4 gap-y-1 min-[720px]:hidden">
        {mode !== 'no-option' ? (
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-[14px] text-meeting-text-secondary underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
            onClick={() => setMobileSheet('people')}
          >
            6명 상황 보기
          </button>
        ) : null}
        {canShowReason ? (
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-[14px] text-meeting-text-secondary underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
            onClick={() => setMobileSheet('reason')}
          >
            이 시간을 고른 이유
          </button>
        ) : null}
      </div>

      {canShowReason ? (
        <button
          ref={reasonTriggerRef}
          type="button"
          className="mt-0.5 hidden min-h-11 items-center text-[14px] leading-[21px] text-meeting-text-secondary underline underline-offset-2 transition-colors hover:text-meeting-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)] min-[720px]:inline-flex"
          onClick={() => {
            if (contextView === 'reason') openPeople()
            else openReason()
          }}
          aria-expanded={contextView === 'reason'}
        >
          {contextView === 'reason' ? '참석 상황 보기' : vm.reasonClosedLabel}
        </button>
      ) : null}
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-[880px]">
      <article
        className={[
          'w-full rounded-3xl border border-meeting-divider bg-meeting-surface px-7 py-7 shadow-[0_12px_32px_rgba(0,27,55,0.06)] max-[719px]:p-5',
          animateIn
            ? 'animate-[card-in_var(--meeting-motion-standard)_var(--meeting-ease-standard)] motion-reduce:animate-none'
            : '',
        ].join(' ')}
      >
        <div className="grid grid-cols-1 gap-6 min-[720px]:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] min-[720px]:items-start min-[720px]:gap-7">
          {decisionColumn}

          <div className="hidden border-l border-meeting-divider pl-6 min-[720px]:block">
            <div
              key={contextView}
              className="animate-[panel-fade_180ms_ease] motion-reduce:animate-none"
              aria-live="polite"
            >
              {contextView === 'people' ? peoplePanel : reasonPanel}
            </div>
          </div>

          {mode === 'no-option' ? (
            <div className="border-t border-meeting-divider pt-5 min-[720px]:hidden">
              {peoplePanel}
            </div>
          ) : null}
        </div>
      </article>

      <MobileBottomSheet
        open={mobileSheet === 'people'}
        title={vm.peoplePanelTitle}
        onClose={() => setMobileSheet(null)}
      >
        {peoplePanel}
      </MobileBottomSheet>

      <MobileBottomSheet
        open={mobileSheet === 'reason'}
        title="이 시간을 고른 이유"
        onClose={() => {
          setMobileSheet(null)
          reasonTriggerRef.current?.focus()
        }}
      >
        <ReasonPanel
          rows={vm.reasonRows}
          note={vm.reasonNote}
          onShowPeople={() => setMobileSheet('people')}
        />
      </MobileBottomSheet>
    </div>
  )
}
