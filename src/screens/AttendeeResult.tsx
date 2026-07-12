import { ResponseResultLayout } from '@/components/attendee/ResponseResultLayout'
import { responseResultCopy } from '@/components/attendee/response-result.copy'

interface AttendeeResultProps {
  approved: boolean
  /** Review mode shows Primary CTA; usertest hides CTA entirely. */
  showReviewCta: boolean
  onContinue: () => void
}

export function AttendeeResult({
  approved,
  showReviewCta,
  onContinue,
}: AttendeeResultProps) {
  const copy = approved
    ? responseResultCopy.approved
    : responseResultCopy.declined

  return (
    <ResponseResultLayout
      title={copy.title}
      description={copy.description}
      showCta={showReviewCta}
      confirmLabel={copy.reviewCta}
      onConfirm={showReviewCta ? onContinue : undefined}
    />
  )
}
