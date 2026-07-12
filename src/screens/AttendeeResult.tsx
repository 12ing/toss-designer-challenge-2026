import { ResponseResultLayout } from '@/components/attendee/ResponseResultLayout'
import { responseResultCopy } from '@/components/attendee/response-result.copy'

interface AttendeeResultProps {
  approved: boolean
  onConfirm: () => void
}

export function AttendeeResult({ approved, onConfirm }: AttendeeResultProps) {
  const copy = approved
    ? responseResultCopy.approved
    : responseResultCopy.declined

  return (
    <ResponseResultLayout
      title={copy.title}
      description={copy.description}
      onConfirm={onConfirm}
    />
  )
}
