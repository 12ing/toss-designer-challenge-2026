import { useRef, type KeyboardEvent } from 'react'
import type { AttendanceType } from '@/types/schedule'

type AttendanceTypeControlProps = {
  name: string
  value: AttendanceType
  onChange: (type: AttendanceType) => void
}

/**
 * Toss TDS-style segmented control:
 * each segment is independently selectable; re-clicking selected keeps state.
 */
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
  const isRequired = value === 'required'
  const requiredRef = useRef<HTMLButtonElement>(null)
  const optionalRef = useRef<HTMLButtonElement>(null)

  const select = (type: AttendanceType) => {
    if (type === value) return
    onChange(type)
  }

  const focusOption = (type: AttendanceType) => {
    const node = type === 'required' ? requiredRef.current : optionalRef.current
    node?.focus()
  }

  const onGroupKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      select('required')
      focusOption('required')
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      select('optional')
      focusOption('optional')
    }
  }

  const onOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    type: AttendanceType,
  ) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      select(type)
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={`${name} 참석 구분`}
      className="relative flex h-11 w-[120px] shrink-0 rounded-2xl bg-meeting-panel p-0.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[color:var(--meeting-focus)] min-[640px]:h-9"
      onKeyDown={onGroupKeyDown}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-2xl shadow-sm motion-safe:transition-[transform,background-color,border-color] motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none"
        style={{
          transform: `translateX(${selectedIndex * 100}%)`,
          backgroundColor: isRequired
            ? 'var(--meeting-primary-subtle)'
            : 'var(--meeting-surface)',
          border: isRequired
            ? '1px solid color-mix(in srgb, var(--meeting-primary) 22%, transparent)'
            : '1px solid var(--meeting-divider)',
        }}
      />

      {options.map((option) => {
        const checked = value === option.type
        return (
          <button
            key={option.type}
            ref={option.type === 'required' ? requiredRef : optionalRef}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => select(option.type)}
            onKeyDown={(event) => onOptionKeyDown(event, option.type)}
            className={[
              'relative z-[1] flex h-full min-h-11 w-[60px] flex-1 items-center justify-center rounded-2xl text-[13px] font-semibold leading-5 transition-colors duration-[180ms] focus:outline-none focus-visible:outline-none min-[640px]:min-h-0',
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
