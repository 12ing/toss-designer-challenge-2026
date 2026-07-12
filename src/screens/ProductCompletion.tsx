import { Button } from '@/components/ui/Button'
import { MeetingParticipantsSummary } from '@/components/meeting/MeetingParticipantsSummary'
import { productCopy } from '@/copy/product.copy'
import type { MeetingParticipantSnapshot } from '@/types/schedule'
import { normalizeMeetingTitle, normalizeMeetingLocation } from '@/lib/meeting-display'
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

/** Product-facing meeting created screen — separate from ReviewCompletion. */
export function ProductCompletion({
  title,
  dateDisplay,
  timeLabel,
  participants,
  location,
  onComplete,
}: ProductCompletionProps) {
  const copy = productCopy.productCompletion
  const safeTitle = normalizeMeetingTitle(title)
  const locationValue = normalizeMeetingLocation(location)
  const locationIsUrl = isMeetingLocationUrl(locationValue)

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="rounded-[var(--meeting-radius-card)] bg-meeting-surface p-8 shadow-[var(--meeting-shadow)] max-[360px]:px-5">
        <h2
          data-page-heading
          tabIndex={-1}
          className="mb-6 text-[22px] font-bold leading-8 text-meeting-text outline-none focus:outline-none focus-visible:outline-none"
          style={{ wordBreak: 'keep-all' }}
        >
          {copy.title}
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
                {copy.joinVideo}
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

        <MeetingParticipantsSummary
          participants={participants}
          className="mb-8"
        />

        <Button type="button" onClick={onComplete}>
          {copy.primaryAction}
        </Button>
      </div>
    </div>
  )
}
