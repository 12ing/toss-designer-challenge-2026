import { AttendanceSummary } from '@/components/AttendanceSummary'
import { ReasonDisclosure } from '@/components/ReasonDisclosure'
import { Button } from '@/components/ui/Button'
import { TextButton } from '@/components/ui/TextButton'
import type { DecisionCardState } from '@/types/schedule'

export type DecisionCardProps = {
  variant: DecisionCardState
  stateMessage: string | string[]
  dateDisplay: string
  timeLabel: string
  requiredText?: string
  optionalText?: string
  confirmationRequirement?: string
  resultMessage?: string
  reasons?: string[]
  details?: string[]
  disclosureNote?: string
  helperText?: string
  primaryCtaText: string
  primaryLoading?: boolean
  onPrimaryCta: () => void
  reasonExpanded?: boolean
  onToggleReason?: () => void
  showReasonDisclosure?: boolean
  onChangeConditions?: () => void
  onCancelRequest?: () => void
  animateIn?: boolean
}

export function DecisionCard({
  variant,
  stateMessage,
  dateDisplay,
  timeLabel,
  requiredText,
  optionalText,
  confirmationRequirement,
  resultMessage,
  reasons = [],
  details = [],
  disclosureNote,
  helperText,
  primaryCtaText,
  primaryLoading = false,
  onPrimaryCta,
  reasonExpanded = false,
  onToggleReason,
  showReasonDisclosure = false,
  onChangeConditions,
  onCancelRequest,
  animateIn = false,
}: DecisionCardProps) {
  const messages = Array.isArray(stateMessage) ? stateMessage : [stateMessage]
  const showPrimary = variant !== 'waiting'
  const showAttendance =
    (variant === 'ready' || variant === 'ready-after-confirmation') &&
    requiredText &&
    optionalText

  return (
    <div className="flex w-full flex-col">
      <article
        className={[
          'w-full rounded-[20px] bg-background px-7 py-8 sm:px-8',
          animateIn
            ? 'animate-[card-in_320ms_ease-out] motion-reduce:animate-none'
            : '',
        ].join(' ')}
      >
        <div className="mb-6 flex flex-col gap-1.5">
          {messages.map((line) => (
            <h2
              key={line}
              className="text-[20px] font-semibold leading-7 tracking-tight text-grey-900"
            >
              {line}
            </h2>
          ))}
        </div>

        <div className="mb-6">
          <p className="mb-1.5 text-[15px] leading-[22px] text-grey-600">
            {dateDisplay}
          </p>
          <p className="text-[28px] font-bold leading-9 tracking-tight text-grey-900">
            {timeLabel}
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3">
          {confirmationRequirement && (
            <p className="text-[15px] font-medium leading-6 text-grey-800">
              {confirmationRequirement}
            </p>
          )}
          {resultMessage && (
            <p className="text-[15px] leading-6 text-grey-600">{resultMessage}</p>
          )}
          {showAttendance && (
            <AttendanceSummary
              requiredText={requiredText}
              optionalText={optionalText}
            />
          )}
          {variant === 'waiting' && requiredText && (
            <div className="flex flex-col gap-1.5 text-[15px] leading-6 text-grey-600">
              <p>{requiredText}</p>
              {optionalText && <p>{optionalText}</p>}
            </div>
          )}
        </div>

        {showPrimary && (
          <Button
            className="mb-5"
            onClick={onPrimaryCta}
            loading={primaryLoading}
          >
            {primaryCtaText}
          </Button>
        )}

        {helperText && (
          <p className="mb-5 text-[14px] leading-[22px] text-grey-500">
            {helperText}
          </p>
        )}

        {reasons.length > 0 && (
          <ul className="mb-5 flex flex-col gap-1.5">
            {reasons.slice(0, 2).map((reason) => (
              <li
                key={reason}
                className="flex items-start gap-2 text-[14px] leading-[22px] text-grey-600"
              >
                <span
                  aria-hidden
                  className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-grey-400"
                />
                {reason}
              </li>
            ))}
          </ul>
        )}

        {showReasonDisclosure && onToggleReason && (
          <ReasonDisclosure
            open={reasonExpanded}
            onToggle={onToggleReason}
            details={details}
            note={disclosureNote}
          />
        )}

        {variant === 'waiting' && (onCancelRequest || onChangeConditions) && (
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

      {onChangeConditions && variant !== 'waiting' && (
        <div className="mt-6 flex justify-center">
          <TextButton onClick={onChangeConditions}>조건 바꾸기</TextButton>
        </div>
      )}
    </div>
  )
}
