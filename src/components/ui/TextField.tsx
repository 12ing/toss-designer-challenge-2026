import { forwardRef, type InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  invalid?: boolean
  errorId?: string
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, id, className = '', invalid = false, errorId, ...props },
    ref,
  ) {
    const fieldId = id ?? label

    return (
      <label className="flex flex-col gap-1.5" htmlFor={fieldId}>
        <span className="text-[13px] font-medium text-meeting-text-secondary">
          {label}
        </span>
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid && errorId ? errorId : undefined}
          className={[
            'h-14 rounded-[var(--meeting-radius-input)] border bg-meeting-surface px-4 text-[16px] text-meeting-text outline-none transition-colors placeholder:text-meeting-text-tertiary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]',
            invalid
              ? 'border-[#f04452] focus:border-[#f04452]'
              : 'border-meeting-divider focus:border-meeting-primary',
            className,
          ].join(' ')}
          {...props}
        />
      </label>
    )
  },
)
