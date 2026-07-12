import { useMemo } from 'react'
import { ParticipantConditionRow } from '@/components/participant-setup/ParticipantConditionRow'
import { SchedulingPrivacyPopover } from '@/components/participant-setup/SchedulingPrivacyPopover'
import { Button } from '@/components/ui/Button'
import { productCopy } from '@/copy/product.copy'
import { mapParticipantsToSetupViewModel } from '@/features/meeting-decision/view-model/participant-setup.mapper'
import type { AttendanceType } from '@/types/schedule'

interface ParticipantSetupProps {
  attendanceTypes: Record<string, AttendanceType>
  onAttendanceTypeChange: (id: string, type: AttendanceType) => void
  onFindTime: () => void
}

export function ParticipantSetup({
  attendanceTypes,
  onAttendanceTypeChange,
  onFindTime,
}: ParticipantSetupProps) {
  const copy = productCopy.setup
  const viewModel = useMemo(
    () => mapParticipantsToSetupViewModel({ attendanceTypes }),
    [attendanceTypes],
  )

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col">
      <div className="mb-5">
        <h2
          data-page-heading
          tabIndex={-1}
          className="mb-2 text-[24px] font-bold leading-[34px] tracking-tight text-meeting-text outline-none"
          style={{ wordBreak: 'keep-all' }}
        >
          {copy.title}
        </h2>
        <p
          className="text-[15px] leading-[23px] text-meeting-text-secondary"
          style={{ wordBreak: 'keep-all' }}
        >
          {copy.description}
        </p>
      </div>

      <div className="mb-4 flex items-baseline justify-between gap-3">
        <p className="text-[13px] text-meeting-text-tertiary">{copy.meta}</p>
        <p
          className="text-[13px] font-medium text-meeting-text-secondary transition-opacity duration-[180ms]"
          aria-live="polite"
        >
          {viewModel.summaryLabel}
        </p>
      </div>

      <section
        className="mb-6 overflow-hidden rounded-3xl border border-meeting-divider bg-meeting-surface shadow-[var(--meeting-shadow)]"
        aria-label="참석자 목록"
      >
        <div className="flex items-center justify-between gap-3 border-b border-meeting-divider px-5 py-3 min-[640px]:hidden">
          <p className="text-[13px] font-medium text-meeting-text-secondary">
            {copy.columnParticipant}
          </p>
          <div className="flex items-center gap-1">
            <p className="text-[13px] font-medium text-meeting-text-secondary">
              {copy.columnCondition}
            </p>
            <SchedulingPrivacyPopover variant="icon" />
          </div>
        </div>

        <div className="hidden grid-cols-[minmax(140px,1.1fr)_minmax(150px,1.2fr)_120px] items-center gap-5 border-b border-meeting-divider px-5 py-3 min-[640px]:grid">
          <p className="text-[13px] font-medium text-meeting-text-secondary">
            {copy.columnParticipant}
          </p>
          <div className="flex min-w-0 items-center gap-1">
            <p className="text-[13px] font-medium text-meeting-text-secondary">
              {copy.columnCondition}
            </p>
            <SchedulingPrivacyPopover variant="icon" />
          </div>
          <p className="justify-self-end text-[13px] font-medium text-meeting-text-secondary">
            {copy.columnAttendance}
          </p>
        </div>

        <ul className="divide-y divide-meeting-divider px-5">
          {viewModel.rows.map((row) => (
            <li key={row.id}>
              <ParticipantConditionRow
                row={row}
                onAttendanceTypeChange={onAttendanceTypeChange}
              />
            </li>
          ))}
        </ul>
      </section>

      <Button onClick={onFindTime} className="min-h-[52px] max-[639px]:min-h-14">
        {copy.primaryAction}
      </Button>
    </div>
  )
}
