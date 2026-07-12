import { AttendanceSummary } from '@/components/AttendanceSummary'
import { ConfirmationPanel } from '@/components/ConfirmationPanel'
import { DateTimeBlock } from '@/components/DateTimeBlock'
import { DecisionStatus } from '@/components/DecisionStatus'
import { SpinnerIcon } from '@/components/icons'
import { ReasonDisclosure } from '@/components/ReasonDisclosure'
import { Button } from '@/components/ui/Button'
import { TextButton } from '@/components/ui/TextButton'
import type { DecisionCardState } from '@/types/schedule'

export type DecisionCardProps = {
  state: DecisionCardState
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
  reasons?: string[]
  details?: Array<{ label: string; value: string }>
  disclosureNote?: string
  supportingText?: string
  waitingImpact?: string
  isReasonExpanded?: boolean
  isLoading?: boolean
  onPrimaryAction?: () => void
  onToggleReason?: () => void
  onCancelRequest?: () => void
  onChangeConditions?: () => void
  animateIn?: boolean
}

function primaryLabel(state: DecisionCardState) {
  if (state === 'ready' || state === 'ready-after-confirmation') {
    return '이 시간으로 확정'
  }
  if (state === 'need-confirmation' || state === 'next-alternative') {
    return '가능 여부 묻기'
  }
  return ''
}

export function DecisionCard({
  state,
  dateLabel,
  timeLabel,
  statusTitle,
  attendance,
  confirmation,
  reasons = [],
  details = [],
  disclosureNote,
  supportingText,
  waitingImpact,
  isReasonExpanded = false,
  isLoading = false,
  onPrimaryAction,
  onToggleReason,
  onCancelRequest,
  onChangeConditions,
  animateIn = false,
}: DecisionCardProps) {
  const showPrimary = state !== 'waiting'
  const showAttendance =
    (state === 'ready' || state === 'ready-after-confirmation') && attendance
  const showConfirmation =
    (state === 'need-confirmation' || state === 'next-alternative') &&
    confirmation
  const showReasons = state === 'ready' && reasons.length > 0
  const showDisclosure =
    state === 'ready' && details.length > 0 && onToggleReason

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col">
      <article
        className={[
          'w-full rounded-[var(--meeting-radius-card)] bg-meeting-surface p-8 shadow-[var(--meeting-shadow)]',
          animateIn
            ? 'animate-[card-in_var(--meeting-motion-standard)_var(--meeting-ease-standard)] motion-reduce:animate-none'
            : '',
        ].join(' ')}
        aria-live="polite"
      >
        <div className="mb-6">
          <DecisionStatus state={state} title={statusTitle} />
        </div>

        <div className="mb-6">
          <DateTimeBlock dateLabel={dateLabel} timeLabel={timeLabel} />
        </div>

        <div className="mb-6">
          {showAttendance && <AttendanceSummary {...attendance} />}
          {showConfirmation && <ConfirmationPanel {...confirmation} />}
          {state === 'waiting' && (
            <div className="flex flex-col gap-2 text-[15px] leading-[23px] text-meeting-text-secondary">
              {waitingImpact && <p>{waitingImpact}</p>}
              {supportingText && <p>{supportingText}</p>}
            </div>
          )}
        </div>

        {showPrimary && onPrimaryAction && (
          <div className="mb-6">
            <Button onClick={onPrimaryAction} loading={isLoading}>
              {primaryLabel(state)}
            </Button>
          </div>
        )}

        {state === 'waiting' && (
          <div
            className="mb-6 flex min-h-[52px] items-center gap-2 rounded-[var(--meeting-radius-button)] bg-meeting-panel px-4 text-[15px] text-meeting-text-secondary"
            role="status"
          >
            <SpinnerIcon className="h-4 w-4 text-meeting-text-tertiary" />
            응답을 기다리는 중
          </div>
        )}

        {state === 'ready-after-confirmation' && supportingText && (
          <p className="mb-6 text-[14px] leading-[21px] text-meeting-text-tertiary">
            {supportingText}
          </p>
        )}

        {showConfirmation && supportingText && (
          <p className="mb-6 text-[14px] leading-[21px] text-meeting-text-tertiary">
            {supportingText}
          </p>
        )}

        {showReasons && (
          <ul className="mb-4 flex flex-col gap-2">
            {reasons.slice(0, 2).map((reason) => (
              <li
                key={reason}
                className="text-[14px] leading-[21px] text-meeting-text-secondary"
              >
                {reason}
              </li>
            ))}
          </ul>
        )}

        {showDisclosure && (
          <ReasonDisclosure
            open={isReasonExpanded}
            onToggle={onToggleReason}
            details={details}
            note={disclosureNote}
          />
        )}

        {state === 'waiting' && (onCancelRequest || onChangeConditions) && (
          <div className="mt-2 flex flex-col items-start gap-1">
            {onCancelRequest && (
              <TextButton onClick={onCancelRequest}>요청 취소</TextButton>
            )}
            {onChangeConditions && (
              <TextButton onClick={onChangeConditions}>조건 바꾸기</TextButton>
            )}
          </div>
        )}
      </article>

      {onChangeConditions && state !== 'waiting' && (
        <div className="mt-6 flex justify-center">
          <TextButton onClick={onChangeConditions}>조건 바꾸기</TextButton>
        </div>
      )}
    </div>
  )
}
