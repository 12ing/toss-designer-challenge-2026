type ReasonPanelProps = {
  rows: Array<{ label: string; value: string }>
  note?: string
  onShowPeople: () => void
}

export function ReasonPanel({ rows, note, onShowPeople }: ReasonPanelProps) {
  return (
    <section className="min-w-0" aria-label="이 시간을 고른 이유" aria-live="polite">
      <h3 className="mb-2 text-[15px] font-bold leading-[23px] text-meeting-text">
        이 시간을 고른 이유
      </h3>
      <dl>
        {rows.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className={[
              'flex min-h-[52px] flex-col justify-center gap-1 py-3',
              index < rows.length - 1 ? 'border-b border-meeting-divider' : '',
            ].join(' ')}
          >
            <dt className="text-[13px] leading-5 text-meeting-text-secondary">
              {item.label}
            </dt>
            <dd
              className="text-[15px] font-medium leading-[22px] text-meeting-text"
              style={{ wordBreak: 'keep-all' }}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
      {note ? (
        <p
          className="mt-3 text-[13px] leading-5 text-meeting-text-tertiary"
          style={{ wordBreak: 'keep-all' }}
        >
          {note}
        </p>
      ) : null}
      <button
        type="button"
        className="mt-3 inline-flex min-h-11 items-center text-[14px] font-medium text-meeting-text-secondary underline underline-offset-2 hover:text-meeting-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
        onClick={onShowPeople}
      >
        참석 상황 보기
      </button>
    </section>
  )
}
