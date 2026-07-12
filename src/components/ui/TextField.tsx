import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function TextField({ label, id, className = '', ...props }: TextFieldProps) {
  const fieldId = id ?? label

  return (
    <label className="flex flex-col gap-1.5" htmlFor={fieldId}>
      <span className="text-[13px] font-medium text-grey-600">{label}</span>
      <input
        id={fieldId}
        className={[
          'h-14 rounded-2xl border border-hairline bg-background px-4 text-[16px] text-grey-900 outline-none transition-colors placeholder:text-grey-400 focus:border-blue-500',
          className,
        ].join(' ')}
        {...props}
      />
    </label>
  )
}
