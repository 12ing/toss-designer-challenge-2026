import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  fullWidth?: boolean
  loading?: boolean
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-100 disabled:text-white/80',
  secondary:
    'bg-grey-100 text-grey-800 hover:bg-grey-200 active:bg-grey-300 disabled:opacity-50',
  ghost:
    'bg-transparent text-grey-600 hover:bg-grey-100 hover:text-grey-800 disabled:opacity-50',
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = true,
  loading = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        'inline-flex min-h-14 items-center justify-center rounded-2xl px-5 text-[17px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        fullWidth ? 'w-full' : '',
        variantClass[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? '요청 보내는 중' : children}
    </button>
  )
}
