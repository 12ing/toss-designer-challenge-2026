import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

type ResponseResultLayoutProps = {
  title: string
  description: ReactNode
  /** When omitted, no bottom CTA is shown (usertest product completion). */
  confirmLabel?: string
  onConfirm?: () => void
  showCta?: boolean
}

/**
 * Attendee response completion — top result, bottom sticky CTA (review only).
 * Shared by approved and declined outcomes.
 */
export function ResponseResultLayout({
  title,
  description,
  onConfirm,
  confirmLabel = '확인',
  showCta = true,
}: ResponseResultLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={[
          'flex-1 overflow-y-auto pt-8 max-[719px]:pt-9',
          showCta ? 'pb-28 max-[719px]:pb-32 min-[720px]:pb-4' : 'pb-8',
        ].join(' ')}
      >
        <h2
          data-page-heading
          tabIndex={-1}
          className="mb-3 text-[24px] font-bold leading-[34px] text-meeting-text outline-none max-[719px]:mb-4"
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

      {showCta && onConfirm ? (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[390px] bg-meeting-surface px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 min-[720px]:static min-[720px]:mx-0 min-[720px]:mt-10 min-[720px]:max-w-none min-[720px]:px-0 min-[720px]:pb-0 min-[720px]:pt-0">
          <Button
            type="button"
            variant="primary"
            size="mobile"
            className="!min-h-[54px]"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
