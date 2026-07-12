type AttendanceSummaryProps = {
  requiredAvailable: number
  requiredTotal: number
  optionalAvailable: number
  optionalTotal: number
}

function formatRequired(available: number, total: number) {
  if (available === total) return `필수 ${total}명 모두 가능`
  return `필수 ${available}명 가능`
}

function formatOptional(available: number, total: number) {
  if (total === 0) return null
  if (available === total) return `선택 ${total}명 모두 가능`
  return `선택 ${total}명 중 ${available}명 가능`
}

export function AttendanceSummary({
  requiredAvailable,
  requiredTotal,
  optionalAvailable,
  optionalTotal,
}: AttendanceSummaryProps) {
  const optionalLine = formatOptional(optionalAvailable, optionalTotal)

  return (
    <div className="flex flex-col gap-2 text-[16px] leading-6 text-meeting-text">
      <p className="font-medium">
        {formatRequired(requiredAvailable, requiredTotal)}
      </p>
      {optionalLine && <p className="font-medium">{optionalLine}</p>}
    </div>
  )
}
