import type { KeyboardEvent } from 'react'
import type { AttendanceType } from '@/types/schedule'

type AttendanceTypeControlProps = {
  name: string
  value: AttendanceType
  onChange: (type: AttendanceType) => void
}

export function AttendanceTypeControl({
  name,
  value,
  onChange,
}: AttendanceTypeControlProps) {
  const options: Array<{ type: AttendanceType; label: string }> = [
    { type: 'required', label: '필수' },
    { type: 'optional', label: '선택' },
  ]
  const selectedIndex = value === 'required' ? 0 : 1

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    onChange(value === 'required' ? 'optional' : 'required')
  }

  return (
    <div
      role="radiogroup"
      aria-label={`${name} 참석 조건`}
      className="relative flex shrink-0 rounded-full bg-meeting-panel p-1"
      onKeyDown={onKeyDown}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-meeting-primary-subtle shadow-sm motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none"
        style={{
          transform: `translateX(${selectedIndex * 100}%)`,
          border: '1px solid color-mix(in srgb, var(--meeting-primary) 22%, transparent)',
        }}
      />

      {options.map((option) => {
        const checked = value === option.type
        return (
          <button
            key={option.type}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.type)}
            className={[
              'relative z-[1] min-h-11 min-w-[52px] flex-1 rounded-full px-3 text-[13px] font-semibold transition-colors duration-[180ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]',
              checked
                ? 'text-[color:var(--meeting-primary)]'
                : 'text-meeting-text-secondary hover:text-meeting-text',
            ].join(' ')}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
