import { useEffect } from 'react'
import { AttendanceSummary } from '@/components/AttendanceSummary'
import { ConfirmationPanel } from '@/components/ConfirmationPanel'
import { DateTimeBlock } from '@/components/DateTimeBlock'
import { DecisionStatus } from '@/components/DecisionStatus'
import { ReasonDisclosure } from '@/components/ReasonDisclosure'
import { Button } from '@/components/ui/Button'
import type { DecisionCardState } from '@/types/schedule'

export type DecisionCardProps = {
  state: DecisionCardState
  contextLabel?: string
  dateLabel: string
  timeLabel: string
  statusTitle: string | string[]
  attendance?: {
    requiredAvailable: number
    requiredTotal: number
    optionalAvailable: number
    optionalTotal: number
  }
  confirmation?: {
    participantName: string
    conflictLabel: string
    resultLabel: string
  }
  details?: Array<{ label: string; value: string }>
  disclosureNote?: string
  supportingText?: string
  confirmationMeta?: string
  footnote?: string
  isReasonExpanded?: boolean
  isLoading?: boolean
  onPrimaryAction?: () => void
  onToggleReason?: () => void
  animateIn?: boolean
  onAnimateInEnd?: () => void
}

function primaryLabel(state: DecisionCardState) {
  if (state === 'ready' || state === 'ready-after-confirmation') {
    return '이 시간으로 확정'
  }
  if (state === 'need-confirmation' || state === 'next-alternative') {
    return '확인 요청하기'
  }
  return ''
}

export function DecisionCard({
  state,
  contextLabel = '다음 주 · 1시간 · 6명',
  dateLabel,
  timeLabel,
  statusTitle,
  attendance,
  confirmation,
  details = [],
  disclosureNote,
  supportingText,
  confirmationMeta,
  footnote,
  isReasonExpanded = false,
  isLoading = false,
  onPrimaryAction,
  onToggleReason,
  animateIn = false,
  onAnimateInEnd,
}: DecisionCardProps) {
  const showPrimary = state !== 'waiting'
  const showAttendance =
    (state === 'ready' || state === 'ready-after-confirmation') && attendance
  const showConfirmation =
    (state === 'need-confirmation' || state === 'next-alternative') &&
    confirmation
  const showDisclosure =
    (state === 'ready' ||
      state === 'need-confirmation' ||
      state === 'next-alternative') &&
    details.length > 0 &&
    onToggleReason

  useEffect(() => {
    if (!animateIn || !onAnimateInEnd) return
    const timer = window.setTimeout(onAnimateInEnd, 280)
    return () => window.clearTimeout(timer)
  }, [animateIn, onAnimateInEnd])

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col">
      <article
        className={[
          'w-full rounded-[var(--meeting-radius-card)] bg-meeting-surface p-8 shadow-[var(--meeting-shadow)]',
          animateIn
            ? 'animate-[card-in_var(--meeting-motion-standard)_var(--meeting-ease-standard)] motion-reduce:animate-none'
            : '',
        ].join(' ')}
      >
        <p className="mb-4 text-[13px] leading-5 text-meeting-text-tertiary">
          {contextLabel}
        </p>

        <div className="mb-5">
          <DateTimeBlock dateLabel={dateLabel} timeLabel={timeLabel} />
        </div>

        <div
          className="mb-6 transition-opacity duration-[var(--meeting-motion-standard)] ease-[var(--meeting-ease-standard)]"
          aria-live="polite"
        >
          <DecisionStatus state={state} title={statusTitle} />
        </div>

        <div className="mb-6 transition-[opacity,max-height] duration-[var(--meeting-motion-standard)] ease-[var(--meeting-ease-standard)]">
          {showAttendance && <AttendanceSummary {...attendance} />}
          {showConfirmation && <ConfirmationPanel {...confirmation} />}
          {state === 'waiting' && (
            <div className="flex flex-col gap-3">
              {supportingText && (
                <p className="text-[15px] leading-[23px] text-meeting-text-secondary">
                  {supportingText}
                </p>
              )}
              {confirmationMeta && (
                <p className="text-[13px] leading-5 text-meeting-text-tertiary">
                  {confirmationMeta}
                </p>
              )}
            </div>
          )}
        </div>

        {showPrimary && onPrimaryAction && (
          <div className="mb-6 transition-opacity duration-[var(--meeting-motion-standard)] ease-[var(--meeting-ease-standard)]">
            <Button onClick={onPrimaryAction} loading={isLoading}>
              {primaryLabel(state)}
            </Button>
          </div>
        )}

        {showDisclosure && (
          <ReasonDisclosure
            open={isReasonExpanded}
            onToggle={onToggleReason}
            details={details}
            note={disclosureNote}
          />
        )}

        {footnote && (
          <p className="mt-4 text-[13px] leading-5 text-meeting-text-tertiary">
            {footnote}
          </p>
        )}
      </article>
    </div>
  )
}
