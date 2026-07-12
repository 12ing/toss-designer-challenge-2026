import type { ReactNode } from 'react'
import { productCopy } from '@/copy/product.copy'
import { reviewCopy } from '@/copy/review.copy'

export type ResponseResultType = 'approved' | 'declined'

export const responseResultCopy: Record<
  ResponseResultType,
  { title: string; description: ReactNode; reviewCta: string }
> = {
  approved: {
    title: productCopy.attendeeResult.approved.title,
    description: (
      <>
        주최자가 회의를 확정하면
        <br />
        일정이 만들어져요.
      </>
    ),
    reviewCta: reviewCopy.actorTransition.toOrganizerCta,
  },
  declined: {
    title: productCopy.attendeeResult.declined.title,
    description: productCopy.attendeeResult.declined.description,
    reviewCta: reviewCopy.actorTransition.toOrganizerCta,
  },
}
