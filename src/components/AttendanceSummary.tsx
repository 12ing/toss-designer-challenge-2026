interface AttendanceSummaryProps {
  requiredText: string
  optionalText: string
}

export function AttendanceSummary({
  requiredText,
  optionalText,
}: AttendanceSummaryProps) {
  return (
    <div className="flex flex-col gap-1.5 text-[15px] leading-6">
      <p className="font-medium text-grey-800">{requiredText}</p>
      <p className="text-grey-500">{optionalText}</p>
    </div>
  )
}
