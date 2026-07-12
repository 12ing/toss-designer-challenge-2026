import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

type ResponseResultLayoutProps = {
  title: string
  description: ReactNode
  onConfirm: () => void
  confirmLabel?: string
}

/**
 * Attendee response completion — top result, bottom sticky confirm.
 * Shared by approved and declined outcomes.
 */
export function ResponseResultLayout({
  title,
  description,
  onConfirm,
  confirmLabel = '확인',
}: ResponseResultLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto pt-8 pb-4 max-[719px]:pt-9">
        <h2
          className="mb-3 text-[24px] font-bold leading-[34px] text-meeting-text max-[719px]:mb-4"
          style={{ wordBreak: 'keep-all' }}
        >
          {title}
        </h2>
        <p
          className="text-[16px] leading-6 text-meeting-text-secondary"
          style={{ wordBreak: 'keep-all' }}
        >
          {description}
        </p>
      </div>

      <div className="sticky bottom-0 shrink-0 -mx-5 mt-auto bg-meeting-surface px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 max-[719px]:pb-[max(1.25rem,env(safe-area-inset-bottom))] min-[720px]:static min-[720px]:mx-0 min-[720px]:mt-10 min-[720px]:px-0 min-[720px]:pb-0 min-[720px]:pt-0">
        <Button
          type="button"
          size="mobile"
          className="!min-h-[54px]"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  )
}
