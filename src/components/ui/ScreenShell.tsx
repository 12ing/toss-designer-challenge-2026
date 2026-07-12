import type { ReactNode } from 'react'

interface ScreenShellProps {
  title?: string
  onClose?: () => void
  children: ReactNode
  layout?: 'desktop' | 'mobile'
  contentWidth?: 'default' | 'wide'
  footer?: ReactNode
  /** Hide the product page chrome title/close row. */
  hideHeader?: boolean
  /** Nested under Review Chrome — avoid stacking another full viewport height. */
  embedded?: boolean
}

export function ScreenShell({
  title,
  onClose,
  children,
  layout = 'desktop',
  contentWidth = 'default',
  footer,
  hideHeader = false,
  embedded = false,
}: ScreenShellProps) {
  const isMobile = layout === 'mobile'
  const wide = contentWidth === 'wide'
  const showHeader = !hideHeader && Boolean(title || onClose)

  return (
    <div
      className={[
        'bg-meeting-bg',
        embedded ? 'flex min-h-0 flex-1 flex-col' : 'min-h-[100dvh]',
        isMobile ? 'flex justify-center' : '',
      ].join(' ')}
    >
      <div
        className={[
          'mx-auto flex w-full flex-col',
          embedded ? 'min-h-0 flex-1' : 'min-h-[100dvh]',
          isMobile
            ? 'max-w-[390px] bg-meeting-surface'
            : wide
              ? 'max-w-[944px] px-8 py-5'
              : 'max-w-[640px] px-8 py-5',
        ].join(' ')}
      >
        {showHeader ? (
          <header
            className={[
              'flex shrink-0 items-center justify-between',
              isMobile
                ? 'h-14 px-5 pt-[env(safe-area-inset-top)]'
                : 'mb-6 h-14',
            ].join(' ')}
          >
            {title ? (
              <h1 className="text-[17px] font-semibold text-meeting-text">
                {title}
              </h1>
            ) : (
              <span />
            )}
          </header>
        ) : null}

        <main
          className={[
            'flex min-h-0 flex-1 flex-col',
            isMobile
              ? 'px-5 pb-0 pt-2'
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
