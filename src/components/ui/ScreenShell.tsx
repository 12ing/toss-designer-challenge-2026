import type { ReactNode } from 'react'
import { TextButton } from '@/components/ui/TextButton'

interface ScreenShellProps {
  title: string
  onClose?: () => void
  children: ReactNode
  /** attendee screens use mobile-first narrow frame */
  layout?: 'desktop' | 'mobile'
  footer?: ReactNode
}

export function ScreenShell({
  title,
  onClose,
  children,
  layout = 'desktop',
  footer,
}: ScreenShellProps) {
  const isMobile = layout === 'mobile'

  return (
    <div
      className={[
        'min-h-screen bg-pc-screen',
        isMobile ? 'flex justify-center' : '',
      ].join(' ')}
    >
      <div
        className={[
          'mx-auto flex min-h-screen w-full flex-col',
          isMobile
            ? 'max-w-[390px] bg-background shadow-[0_0_0_1px_var(--adaptiveHairlineBorder)]'
            : 'max-w-[640px] px-8',
        ].join(' ')}
      >
        <header
          className={[
            'flex shrink-0 items-center justify-between',
            isMobile ? 'h-14 px-5' : 'h-14',
          ].join(' ')}
        >
          <h1 className="text-[17px] font-semibold text-grey-900">{title}</h1>
          {onClose && (
            <TextButton onClick={onClose} className="!min-h-11 no-underline">
              닫기
            </TextButton>
          )}
        </header>

        <main
          className={[
            'flex flex-1 flex-col',
            isMobile ? 'px-5 pb-8 pt-2' : 'pb-10 pt-4',
          ].join(' ')}
        >
          {children}
        </main>

        {footer}
      </div>
    </div>
  )
}
