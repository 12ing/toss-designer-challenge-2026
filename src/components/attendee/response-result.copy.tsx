import type { ReactNode } from 'react'

export type ResponseResultType = 'approved' | 'declined'

export const responseResultCopy: Record<
  ResponseResultType,
  { title: string; description: ReactNode; reviewCta: string }
> = {
  approved: {
    title: '가능하다고 전달했어요.',
    description: (
      <>
        주최자가 회의를 확정하면
        <br />
        일정이 만들어져요.
      </>
    ),
    reviewCta: '확정 가능한 시간 보기',
  },
  declined: {
    title: '어렵다고 전달했어요.',
    description: '다른 시간을 다시 찾을게요.',
    reviewCta: '새로 계산된 시간 보기',
  },
}
