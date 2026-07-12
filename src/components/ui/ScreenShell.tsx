import type { ReactNode } from 'react'
import { TextButton } from '@/components/ui/TextButton'

interface ScreenShellProps {
  title: string
  onClose?: () => void
  children: ReactNode
  layout?: 'desktop' | 'mobile'
  contentWidth?: 'default' | 'wide'
  footer?: ReactNode
}

export function ScreenShell({
  title,
  onClose,
  children,
  layout = 'desktop',
  contentWidth = 'default',
  footer,
}: ScreenShellProps) {
  const isMobile = layout === 'mobile'
  const wide = contentWidth === 'wide'

  return (
    <div
      className={[
        'min-h-screen bg-meeting-bg',
        isMobile ? 'flex justify-center' : '',
      ].join(' ')}
    >
      <div
        className={[
          'mx-auto flex min-h-screen w-full flex-col',
          isMobile
            ? 'max-w-[390px] bg-meeting-surface'
            : wide
              ? 'max-w-[944px] px-8 py-12'
              : 'max-w-[640px] px-8 py-12',
        ].join(' ')}
      >
        <header
          className={[
            'flex shrink-0 items-center justify-between',
            isMobile
              ? 'h-14 px-5 pt-[env(safe-area-inset-top)]'
              : 'mb-6 h-14',
          ].join(' ')}
        >
          <h1 className="text-[17px] font-semibold text-meeting-text">
            {title}
          </h1>
          {onClose && (
            <TextButton onClick={onClose} className="!min-h-11 no-underline">
              닫기
            </TextButton>
          )}
        </header>

        <main
          className={[
            'flex flex-1 flex-col',
            isMobile
              ? 'px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-2'
              : '',
          ].join(' ')}
        >
          {children}
        </main>

        {footer ? (
          <div
            className={
              isMobile ? 'px-5 pb-[max(1rem,env(safe-area-inset-bottom))]' : ''
            }
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
