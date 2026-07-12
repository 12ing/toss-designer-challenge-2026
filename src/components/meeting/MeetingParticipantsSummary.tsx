import { Fragment } from 'react'
import {
  formatMeetingAttendeeTotal,
  formatOptionalAttendeeHeading,
  formatRequiredAttendeeHeading,
} from '@/copy/formatters'
import type { MeetingParticipantSnapshot } from '@/types/schedule'

type MeetingParticipantsSummaryProps = {
  participants: MeetingParticipantSnapshot[]
  className?: string
}

function NameList({ names }: { names: string[] }) {
  if (names.length === 0) return null
  return (
    <p
      className="max-w-full text-[15px] leading-[23px] text-meeting-text"
      style={{ wordBreak: 'keep-all', overflowWrap: 'anywhere' }}
    >
      {names.map((name, index) => (
        <Fragment key={`${name}-${index}`}>
          {index > 0 ? (
            <span className="text-meeting-text-tertiary"> · </span>
          ) : null}
          <span>{name}</span>
        </Fragment>
      ))}
    </p>
  )
}

/** Shared attendee list for MeetingDetails and ProductCompletion. */
export function MeetingParticipantsSummary({
  participants,
  className = '',
}: MeetingParticipantsSummaryProps) {
  const required = participants.filter((p) => p.role === 'required')
  const optional = participants.filter((p) => p.role === 'optional')

  return (
    <div className={`flex flex-col ${className}`.trim()}>
      <p className="mb-3.5 text-[15px] font-semibold leading-[23px] text-meeting-text">
        {formatMeetingAttendeeTotal(participants.length)}
      </p>

      {required.length > 0 ? (
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-medium leading-5 text-meeting-text-secondary">
            {formatRequiredAttendeeHeading(required.length)}
          </p>
          <NameList names={required.map((p) => p.name)} />
        </div>
      ) : null}

      <div
        className={`flex flex-col gap-1 ${required.length > 0 ? 'mt-2.5' : ''}`}
      >
        <p className="text-[13px] font-medium leading-5 text-meeting-text-secondary">
          {formatOptionalAttendeeHeading(optional.length)}
        </p>
        {optional.length > 0 ? (
          <NameList names={optional.map((p) => p.name)} />
        ) : null}
      </div>
    </div>
  )
}
