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
      <span
        aria-hidden
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-meeting-positive-subtle text-meeting-positive"
      >
        <CheckIcon className="h-3 w-3" />
      </span>
    )
  }
  if (mode === 'waiting') {
    return (
      <span
        aria-hidden
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-meeting-panel text-meeting-text-secondary"
      >
        <ClockIcon className="h-3.5 w-3.5" />
      </span>
    )
  }
  if (mode === 'no-option') {
    return null
  }
  return (
    <span
      aria-hidden
      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-meeting-panel text-meeting-text-secondary"
    >
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
  const titleRef = useRef<HTMLHeadingElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    titleRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previouslyFocused.current?.focus()
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const container = panelRef.current
    if (!container) return
    const FOCUSABLE =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const nodes = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null || el === titleRef.current)
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (event.shiftKey && (active === first || active === titleRef.current)) {
        event.preventDefault()
        last.focus()
        return
      }
      if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    container.addEventListener('keydown', onKeyDown)
    return () => container.removeEventListener('keydown', onKeyDown)
  }, [open])

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
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[70vh] w-full flex-col overflow-hidden rounded-t-3xl bg-meeting-surface shadow-[0_-8px_32px_rgba(0,27,55,0.12)]"
      >
        <div className="flex shrink-0 flex-col items-center px-5 pt-3">
          <div
            aria-hidden
            className="mb-3 h-1 w-10 rounded-full bg-meeting-divider"
          />
          <div className="mb-3 flex w-full items-center justify-between gap-3">
            <h3
              ref={titleRef}
              id={titleId}
              tabIndex={-1}
              className="text-[16px] font-semibold text-meeting-text outline-none"
            >
              {title}
            </h3>
            <button
              type="button"
              className="inline-flex min-h-11 items-center px-2 text-[14px] font-medium text-meeting-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
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

  const peopleSheetPanel = (
    <PeopleImpactPanel
      title={vm.peoplePanelTitle}
      requiredRows={vm.requiredRows}
      optionalRows={vm.optionalRows}
      blockingRows={vm.blockingRows}
      mobileSummary={vm.mobilePeopleSummary}
      mobileConfirmationHint={vm.mobileConfirmationHint}
      collapsibleOnMobile={false}
      forceExpanded
      hideTitle
    />
  )

  const reasonPanel = (
    <ReasonPanel rows={vm.reasonRows} note={vm.reasonNote} />
  )

  const panelToggleClass =
    'inline-flex min-h-11 items-center text-[14px] leading-[21px] text-meeting-text-secondary underline-offset-2 transition-colors hover:text-meeting-text hover:underline focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)] focus-visible:underline'

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
          <h2
            data-page-heading
            tabIndex={-1}
            className="text-[32px] font-bold leading-[42px] tracking-tight text-meeting-text outline-none focus:outline-none focus-visible:outline-none max-[719px]:text-[30px] max-[719px]:leading-[40px]"
          >
            {vm.timeLabel}
          </h2>
        </div>
      ) : (
        <h2
          data-page-heading
          tabIndex={-1}
          className="sr-only outline-none focus:outline-none focus-visible:outline-none"
        >
          {vm.stateLabel}
        </h2>
      )}

      <div className="mb-3.5 flex items-start gap-2">
        <StateIcon mode={mode} />
        <p
          className="text-[17px] font-semibold leading-[26px] text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
          aria-live="polite"
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

      <div
        className="flex flex-wrap gap-x-4 gap-y-1 min-[720px]:hidden"
        {...(mobileSheet ? { inert: true } : {})}
      >
        {mode !== 'no-option' ? (
          <button
            type="button"
            className={panelToggleClass}
            disabled={Boolean(mobileSheet)}
            onClick={() => setMobileSheet('people')}
          >
            6명 상황 보기
          </button>
        ) : null}
        {canShowReason ? (
          <button
            type="button"
            className={panelToggleClass}
            disabled={Boolean(mobileSheet)}
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
          className={`${panelToggleClass} mt-0.5 hidden min-[720px]:inline-flex`}
          onClick={() => {
            if (contextView === 'reason') openPeople()
            else openReason()
          }}
          aria-controls="decision-detail-panel"
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
          'w-full overflow-visible rounded-3xl border border-meeting-divider bg-meeting-surface px-7 py-7 shadow-[0_12px_32px_rgba(0,27,55,0.06)] max-[719px]:p-5',
          animateIn
            ? 'animate-[card-in_var(--meeting-motion-standard)_var(--meeting-ease-standard)] motion-reduce:animate-none'
            : '',
        ].join(' ')}
      >
        <div className="grid grid-cols-1 gap-6 min-[720px]:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] min-[720px]:items-start min-[720px]:gap-7">
          {decisionColumn}

          <div className="hidden min-w-0 overflow-visible border-l border-meeting-divider pl-6 min-[720px]:block">
            <div
              id="decision-detail-panel"
              key={contextView}
              className="animate-[panel-fade_160ms_ease] motion-reduce:animate-none"
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
        open={mobileSheet === 'people' || mobileSheet === 'reason'}
        title={
          mobileSheet === 'reason' ? '이 시간을 고른 이유' : vm.peoplePanelTitle
        }
        onClose={() => {
          const wasReason = mobileSheet === 'reason'
          setMobileSheet(null)
          if (wasReason) reasonTriggerRef.current?.focus()
        }}
      >
        {mobileSheet === 'reason' ? (
          <ReasonPanel
            rows={vm.reasonRows}
            note={vm.reasonNote}
            hideTitle
            onShowPeople={() => setMobileSheet('people')}
          />
        ) : (
          peopleSheetPanel
        )}
      </MobileBottomSheet>
    </div>
  )
}
