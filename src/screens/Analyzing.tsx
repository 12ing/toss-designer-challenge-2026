import { useEffect, useState } from 'react'
import { productCopy } from '@/copy/product.copy'

export function Analyzing() {
  const [showSecondary, setShowSecondary] = useState(false)
  const copy = productCopy.analyzing

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSecondary(true), 550)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div
      className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-start justify-center gap-3 py-20"
      role="status"
      aria-live="polite"
    >
      <div aria-hidden className="mb-3 flex items-center gap-1.5">
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
        {copy.title}
      </h2>
      <p
        className="max-w-md text-[15px] leading-[23px] text-meeting-text-secondary"
        style={{ wordBreak: 'keep-all' }}
      >
        {copy.description}
      </p>
      {showSecondary ? (
        <p
          className="max-w-md text-[14px] leading-[21px] text-meeting-text-tertiary"
          style={{ wordBreak: 'keep-all' }}
        >
          {copy.secondary}
        </p>
      ) : null}
    </div>
  )
}
