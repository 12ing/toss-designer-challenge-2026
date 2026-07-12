import { Fragment } from 'react'
import { Button } from '@/components/ui/Button'
import type { MeetingParticipantSnapshot } from '@/features/meeting-decision/connected-flow/connected-flow.types'
import { sanitizeMeetingDisplayText } from '@/lib/meeting-display'
import {
  isMeetingLocationUrl,
  toMeetingLocationHref,
} from '@/lib/meeting-location'

interface ProductCompletionProps {
  title: string
  dateDisplay: string
  timeLabel: string
  participants: MeetingParticipantSnapshot[]
  location?: string
  onComplete: () => void
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

/** Product-facing meeting created screen — separate from ReviewCompletion. */
export function ProductCompletion({
  title,
  dateDisplay,
  timeLabel,
  participants,
  location,
  onComplete,
}: ProductCompletionProps) {
  const safeTitle = sanitizeMeetingDisplayText(title)
  const locationValue = sanitizeMeetingDisplayText(location)
  const locationIsUrl = isMeetingLocationUrl(locationValue)

  const required = participants.filter((p) => p.role === 'required')
  const optional = participants.filter((p) => p.role === 'optional')
  const totalCount = participants.length

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="rounded-[var(--meeting-radius-card)] bg-meeting-surface p-8 shadow-[var(--meeting-shadow)] max-[360px]:px-5">
        <h2
          data-page-heading
          tabIndex={-1}
          className="mb-6 text-[22px] font-bold leading-8 text-meeting-text outline-none focus:outline-none focus-visible:outline-none"
          style={{ wordBreak: 'keep-all' }}
        >
          회의를 만들었어요.
        </h2>

        <div className="mb-6 flex flex-col gap-1.5">
          <p className="text-[15px] text-meeting-text-secondary">{dateDisplay}</p>
          <p className="text-[20px] font-bold text-meeting-text">{timeLabel}</p>
          {safeTitle ? (
            <p
              className="mt-1 text-[17px] font-semibold text-meeting-text"
              style={{ wordBreak: 'keep-all', overflowWrap: 'anywhere' }}
            >
              {safeTitle}
            </p>
          ) : null}
          {locationValue ? (
            locationIsUrl ? (
              <a
                href={toMeetingLocationHref(locationValue)}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-flex w-fit max-w-full text-[15px] font-medium text-meeting-primary underline underline-offset-2 hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
                style={{ wordBreak: 'keep-all' }}
              >
                화상 회의 참여하기
              </a>
            ) : (
              <p
                className="text-[15px] text-meeting-text-secondary"
                style={{ wordBreak: 'keep-all', overflowWrap: 'anywhere' }}
              >
                {locationValue}
              </p>
            )
          ) : null}
        </div>

        <div className="mb-8 flex flex-col gap-5">
          <p className="text-[15px] font-semibold leading-[23px] text-meeting-text">
            참석자 {totalCount}명
          </p>

          {required.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-[13px] font-medium leading-5 text-meeting-text-secondary">
                필수 참석자 {required.length}명
              </p>
              <NameList names={required.map((p) => p.name)} />
            </div>
          ) : null}

          {optional.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-[13px] font-medium leading-5 text-meeting-text-secondary">
                선택 참석자 {optional.length}명
              </p>
              <NameList names={optional.map((p) => p.name)} />
            </div>
          ) : null}
        </div>

        <Button type="button" onClick={onComplete}>
          완료
        </Button>
      </div>
    </div>
  )
}
