import type { ReactNode } from 'react'

export type ResponseResultType = 'approved' | 'declined'

export const responseResultCopy: Record<
  ResponseResultType,
  { title: string; description: ReactNode }
> = {
  approved: {
    title: '가능하다고 전달했어요.',
    description: (
      <>
        회의가 확정되면
        <br />
        캘린더에 반영돼요.
      </>
    ),
  },
  declined: {
    title: '어렵다고 전달했어요.',
    description: '다른 시간을 다시 찾아볼게요.',
  },
}
