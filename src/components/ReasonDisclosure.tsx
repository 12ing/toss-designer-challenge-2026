import { useEffect, useRef } from 'react'

type ReasonDetail = {
  label: string
  value: string
}

type ReasonDisclosureProps = {
  open: boolean
  onToggle: () => void
  details: ReasonDetail[]
  note?: string
}

export function ReasonDisclosure({
  open,
  onToggle,
  details,
  note,
}: ReasonDisclosureProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(open)

  useEffect(() => {
    if (open && !wasOpen.current) {
      panelRef.current?.focus()
    }
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
      >
        {open ? '이유 숨기기' : '이 시간인 이유'}
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-[var(--meeting-motion-standard)] ease-[var(--meeting-ease-standard)] motion-reduce:transition-none ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div
            ref={panelRef}
            tabIndex={-1}
            className="mt-2 outline-none"
          >
            <dl>
              {details.map((item, index) => (
                <div
                  key={item.label}
                  className={[
                    'grid grid-cols-[120px_1fr] items-start gap-4 py-4',
                    index < details.length - 1
                      ? 'border-b border-meeting-divider'
                      : '',
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
            {note && (
              <p className="mt-2 text-[14px] leading-[21px] text-meeting-text-secondary">
                {note}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
