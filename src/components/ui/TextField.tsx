import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function TextField({ label, id, className = '', ...props }: TextFieldProps) {
  const fieldId = id ?? label

  return (
    <label className="flex flex-col gap-1.5" htmlFor={fieldId}>
      <span className="text-[13px] font-medium text-meeting-text-secondary">
        {label}
      </span>
      <input
        id={fieldId}
        className={[
          'h-14 rounded-[var(--meeting-radius-input)] border border-meeting-divider bg-meeting-surface px-4 text-[16px] text-meeting-text outline-none transition-colors placeholder:text-meeting-text-tertiary focus:border-meeting-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]',
          className,
        ].join(' ')}
        {...props}
      />
    </label>
  )
}
