type DateTimeBlockProps = {
  dateLabel: string
  timeLabel: string
  compact?: boolean
}

export function DateTimeBlock({
  dateLabel,
  timeLabel,
  compact = false,
}: DateTimeBlockProps) {
  return (
    <div>
      <p
        className={[
          'font-semibold text-meeting-text-secondary',
          compact
            ? 'mb-1 text-[16px] leading-6'
            : 'mb-2 text-[18px] leading-[26px]',
        ].join(' ')}
      >
        {dateLabel}
      </p>
      <p
        className={[
          'font-bold tracking-tight text-meeting-text',
          compact
            ? 'text-[28px] leading-[38px]'
            : 'text-[36px] leading-[46px]',
        ].join(' ')}
      >
        {timeLabel}
      </p>
    </div>
  )
}
