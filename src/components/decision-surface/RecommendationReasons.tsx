import { useEffect, useId, useRef } from 'react'

type RecommendationReasonsProps = {
  open: boolean
  onToggle: () => void
  closedLabel: string
  rows: Array<{ label: string; value: string }>
  note?: string
}

export function RecommendationReasons({
  open,
  onToggle,
  closedLabel,
  rows,
  note,
}: RecommendationReasonsProps) {
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(open)

  useEffect(() => {
    if (!open && wasOpen.current) {
      buttonRef.current?.focus()
    }
    wasOpen.current = open
  }, [open])

  return (
    <div className="border-t border-meeting-divider pt-4">
      <button
        ref={buttonRef}
        type="button"
        className="min-h-11 text-[14px] leading-[21px] text-meeting-text-secondary underline underline-offset-2 transition-colors hover:text-meeting-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        {open ? '이유 숨기기' : closedLabel}
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows,opacity] duration-[var(--meeting-motion-standard)] ease-[var(--meeting-ease-standard)] motion-reduce:transition-none ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <dl className="mt-2">
            {rows.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className={[
                  'grid grid-cols-[120px_1fr] items-start gap-4 py-4',
                  index < rows.length - 1 ? 'border-b border-meeting-divider' : '',
                ].join(' ')}
              >
                <dt className="text-[14px] leading-[21px] text-meeting-text-secondary">
                  {item.label}
                </dt>
                <dd className="text-[15px] leading-[23px] text-meeting-text">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
          {note ? (
            <p className="mt-2 text-[14px] leading-[21px] text-meeting-text-secondary">
              {note}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
