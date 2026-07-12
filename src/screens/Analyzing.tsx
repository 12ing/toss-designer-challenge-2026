import { useEffect, useState } from 'react'

export function Analyzing() {
  const [phase, setPhase] = useState<'primary' | 'secondary'>('primary')

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase('secondary'), 550)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div
      className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-start justify-center gap-3 py-20"
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden
        className="mb-3 flex items-center gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-meeting-text-secondary motion-safe:animate-pulse"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </div>

      <h2
        className="text-[22px] font-bold leading-8 text-meeting-text transition-opacity duration-[var(--meeting-motion-standard)]"
        style={{ wordBreak: 'keep-all' }}
      >
        {phase === 'primary'
          ? '필수 참석자가 모두 가능한 시간을 찾고 있어요.'
          : '일정 충돌과 개인 선호를 함께 비교하고 있어요.'}
      </h2>
      <p
        className="max-w-md text-[15px] leading-[23px] text-meeting-text-secondary"
        style={{ wordBreak: 'keep-all' }}
      >
        없다면 확인이 가장 적게 필요한 시간까지 함께 제안할게요.
      </p>
    </div>
  )
}
