interface ReasonDisclosureProps {
  open: boolean
  onToggle: () => void
  details: string[]
  note?: string
  title?: string
}

export function ReasonDisclosure({
  open,
  onToggle,
  details,
  note,
  title = '이 시간을 추천한 이유',
}: ReasonDisclosureProps) {
  return (
    <div className="border-t border-hairline pt-4">
      <button
        type="button"
        className="min-h-11 text-[13px] leading-5 text-grey-500 underline underline-offset-2 transition-colors hover:text-grey-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        onClick={onToggle}
        aria-expanded={open}
      >
        {open ? '추천 기준 접기' : '추천 기준 보기'}
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-4 rounded-2xl bg-grey-50 px-4 py-4">
            <p className="mb-3 text-[13px] font-semibold text-grey-800">
              {title}
            </p>
            <ul className="mb-3 flex flex-col gap-2">
              {details.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[13px] leading-5 text-grey-600"
                >
                  <span
                    aria-hidden
                    className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-grey-400"
                  />
                  {item}
                </li>
              ))}
            </ul>
            {note && (
              <p className="text-[13px] leading-5 text-grey-500">{note}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
