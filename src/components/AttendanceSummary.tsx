type AttendanceSummaryProps = {
  requiredAvailable: number
  requiredTotal: number
  optionalAvailable: number
  optionalTotal: number
}

function formatRequired(available: number, total: number) {
  if (available === total) return `${total}명 모두 가능`
  return `${available}명 가능`
}

function formatOptional(available: number, total: number) {
  if (available === total) return `${total}명 모두 가능`
  return `${total}명 중 ${available}명 가능`
}

export function AttendanceSummary({
  requiredAvailable,
  requiredTotal,
  optionalAvailable,
  optionalTotal,
}: AttendanceSummaryProps) {
  return (
    <div className="flex flex-col gap-3 text-[16px] leading-6">
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <span className="font-medium text-meeting-text-secondary">
          필수 참석자
        </span>
        <span className="font-medium text-meeting-text">
          {formatRequired(requiredAvailable, requiredTotal)}
        </span>
        <span className="font-medium text-meeting-text-secondary">
          선택 참석자
        </span>
        <span className="font-medium text-meeting-text">
          {formatOptional(optionalAvailable, optionalTotal)}
        </span>
      </div>
    </div>
  )
}
