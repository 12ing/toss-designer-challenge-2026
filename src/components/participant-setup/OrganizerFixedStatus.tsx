/** Static attendance status for the organizer — not a disabled control. */
export function OrganizerFixedStatus() {
  return (
    <span
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-meeting-divider bg-meeting-panel px-3.5 text-[13px] font-semibold text-meeting-text"
      aria-hidden
    >
      필수 고정
    </span>
  )
}
