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
        'min-h-11 text-[15px] font-medium text-grey-500 underline-offset-2 transition-colors hover:text-grey-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
