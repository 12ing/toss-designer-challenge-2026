import { useEffect, useState } from 'react'

type RuleOrderExplanationProps = {
  /** Controlled open state for captures / tests. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function RuleOrderExplanation({
  open: controlledOpen,
  onOpenChange,
}: RuleOrderExplanationProps = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  useEffect(() => {
    if (isControlled) return
    const mq = window.matchMedia('(min-width: 1100px)')
    const sync = () => {
      if (mq.matches) setUncontrolledOpen(true)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [isControlled])

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <section
      className="rounded-2xl border border-meeting-divider bg-meeting-panel/50 px-5 py-4"
      aria-labelledby="rule-order-heading"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="rule-order-heading"
          className="text-[14px] font-semibold text-meeting-text"
        >
          시간을 비교하는 기준
        </h2>
        <button
          type="button"
          className="inline-flex min-h-10 shrink-0 items-center text-[13px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)] @[1100px]/lab:hidden"
          aria-expanded={open}
          aria-controls="rule-order-list"
          onClick={() => setOpen(!open)}
        >
          {open ? '접기' : '보기'}
        </button>
      </div>

      <ol
        id="rule-order-list"
        className={[
          'mt-3 flex-col gap-2 text-[13px] leading-5 text-meeting-text-secondary',
          open ? 'flex' : 'hidden',
          '@[1100px]/lab:flex',
        ].join(' ')}
      >
        <li style={{ wordBreak: 'keep-all' }}>
          1. 필수 참석자의 고정 일정과 겹치지 않는 시간
        </li>
        <li style={{ wordBreak: 'keep-all' }}>
          2. 확인이 필요한 사람이 더 적은 시간
        </li>
        <li style={{ wordBreak: 'keep-all' }}>
          3. 필수 참석자의 선호 충돌이 더 적은 시간
        </li>
        <li style={{ wordBreak: 'keep-all' }}>
          4. 선택 참석자가 더 많이 가능한 시간
        </li>
        <li style={{ wordBreak: 'keep-all' }}>
          5. 이동과 연속 회의 부담이 더 적은 시간
        </li>
      </ol>
    </section>
  )
}
