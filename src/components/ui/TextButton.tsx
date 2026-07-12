import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function TextButton({
  children,
  className = '',
  type = 'button',
  ...props
}: TextButtonProps) {
  return (
    <button
      type={type}
      className={[
        'min-h-11 text-[15px] font-medium text-meeting-text-secondary underline-offset-2 transition-colors hover:text-meeting-text hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
