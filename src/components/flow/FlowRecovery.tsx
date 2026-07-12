import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

type FlowRecoveryProps = {
  title: string
  description?: string
  actionLabel: string
  onAction?: () => void
  href?: string
}

/** Single recovery action for invalid routes and stale states. */
export function FlowRecovery({
  title,
  description,
  actionLabel,
  onAction,
  href = '/',
}: FlowRecoveryProps) {
  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col py-10">
      <h2
        data-page-heading
        tabIndex={-1}
        className="mb-3 text-[22px] font-bold leading-8 text-meeting-text outline-none focus:outline-none focus-visible:outline-none"
        style={{ wordBreak: 'keep-all' }}
      >
        {title}
      </h2>
      {description ? (
        <p
          className="mb-8 text-[16px] leading-6 text-meeting-text-secondary"
          style={{ wordBreak: 'keep-all' }}
        >
          {description}
        </p>
      ) : (
        <div className="mb-8" />
      )}
      {onAction ? (
        <Button type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : (
        <Link to={href} className="block">
          <Button type="button">{actionLabel}</Button>
        </Link>
      )}
    </div>
  )
}
