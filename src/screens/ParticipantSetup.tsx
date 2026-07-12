import { useMemo } from 'react'
import { ParticipantConditionRow } from '@/components/participant-setup/ParticipantConditionRow'
import { SchedulingPrivacyPopover } from '@/components/participant-setup/SchedulingPrivacyPopover'
import { Button } from '@/components/ui/Button'
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
  const viewModel = useMemo(
    () => mapParticipantsToSetupViewModel({ attendanceTypes }),
    [attendanceTypes],
  )

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col">
      <div className="mb-6">
        <h2
          className="mb-2 text-[24px] font-bold leading-[34px] tracking-tight text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          참석 조건을 확인해주세요
        </h2>
        <p
          className="mb-3 text-[15px] leading-[23px] text-meeting-text-secondary"
          style={{ wordBreak: 'keep-all' }}
        >
          필수 참석자가 모두 가능한 시간을 우선해서 찾을게요.
        </p>
        <p className="text-[13px] text-meeting-text-tertiary">
          다음 주 · 1시간 · 6명
        </p>
      </div>

      <p
        className="mb-5 text-[14px] font-medium text-meeting-text-secondary transition-opacity duration-[180ms]"
        aria-live="polite"
      >
        {viewModel.summaryLabel}
      </p>

      <div className="mb-3 hidden grid-cols-[minmax(140px,1.1fr)_minmax(150px,1.2fr)_minmax(120px,auto)] items-end gap-5 min-[640px]:grid">
        <p className="text-[13px] font-medium text-meeting-text-secondary">
          참석자
        </p>
        <div className="flex min-w-0 items-center gap-1">
          <p className="text-[13px] font-medium text-meeting-text-secondary">
            공유된 일정 조건
          </p>
          <SchedulingPrivacyPopover variant="icon" />
        </div>
        <p className="justify-self-end text-[13px] font-medium text-meeting-text-secondary">
          참석 구분
        </p>
      </div>

      <section
        className="mb-6 rounded-3xl border border-meeting-divider bg-meeting-surface px-5 py-2 shadow-[var(--meeting-shadow)]"
        aria-label="참석자 목록"
      >
        <ul className="divide-y divide-meeting-divider">
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
        이 조건으로 시간 찾기
      </Button>
    </div>
  )
}
