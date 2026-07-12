export function Analyzing() {
  return (
    <div
      className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-start justify-center gap-3 py-20"
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden
        className="mb-2 h-10 w-10 rounded-full bg-meeting-primary-subtle"
      />
      <h2 className="text-[22px] font-bold leading-8 text-meeting-text">
        6명의 일정을 확인하고 있어요.
      </h2>
      <p className="max-w-md text-[15px] leading-[23px] text-meeting-text-secondary">
        꼭 참석해야 하는 사람의 일정과 개인 선호를 함께 살펴보고 있어요.
      </p>
    </div>
  )
}
