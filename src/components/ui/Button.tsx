import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import { SpinnerIcon } from '@/components/icons'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  fullWidth?: boolean
  loading?: boolean
  size?: 'desktop' | 'mobile'
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-meeting-primary text-white hover:brightness-95 active:bg-meeting-primary-pressed disabled:opacity-50',
  secondary:
    'border border-meeting-divider bg-meeting-surface text-meeting-text hover:bg-meeting-panel active:bg-meeting-panel disabled:opacity-50',
  ghost:
    'bg-transparent text-meeting-text-secondary hover:bg-meeting-panel hover:text-meeting-text disabled:opacity-50',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      variant = 'primary',
      fullWidth = true,
      loading = false,
      size = 'desktop',
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref,
  ) {
    const height = size === 'mobile' ? 'min-h-14' : 'min-h-[52px]'

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center gap-2 rounded-[var(--meeting-radius-button)] px-5 text-[16px] font-semibold leading-6 whitespace-nowrap transition-[background-color,filter,color] duration-[var(--meeting-motion-quick)] ease-[var(--meeting-ease-standard)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]',
          height,
          fullWidth ? 'w-full' : '',
          variantClass[variant],
          className,
        ].join(' ')}
        {...props}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
      >
        {loading ? (
          <>
            <SpinnerIcon className="h-4 w-4" />
            요청 보내는 중
          </>
        ) : (
          children
        )}
      </button>
    )
  },
)
