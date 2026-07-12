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
  const headingRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(open)

  useEffect(() => {
    if (open && !wasOpen.current) {
      headingRef.current?.focus()
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
        className="min-h-11 text-[14px] leading-[21px] text-meeting-text-tertiary underline underline-offset-2 transition-colors hover:text-meeting-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
        onClick={onToggle}
        aria-expanded={open}
      >
        {open ? '추천 기준 접기' : '추천 기준 보기'}
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-[var(--meeting-motion-standard)] ease-[var(--meeting-ease-standard)] motion-reduce:transition-none ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-4">
            <p
              ref={headingRef}
              tabIndex={-1}
              className="mb-4 text-[15px] font-semibold text-meeting-text outline-none"
            >
              이 시간을 추천한 이유
            </p>
            <dl className="grid gap-4 sm:grid-cols-2">
              {details.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
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
              <p className="mt-4 text-[14px] leading-[21px] text-meeting-text-tertiary">
                {note}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
