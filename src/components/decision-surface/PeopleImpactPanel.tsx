import { useState } from 'react'
import { ParticipantImpactRow } from '@/components/decision-surface/ParticipantImpactRow'
import { TextButton } from '@/components/ui/TextButton'
import type { ParticipantImpactViewModel } from '@/features/meeting-decision/view-model/decision-surface.mapper'

type PeopleImpactPanelProps = {
  title: string
  rows: ParticipantImpactViewModel[]
  blockingRows?: Array<{ label: string; value: string }>
  mobileSummary: string
  collapsibleOnMobile?: boolean
}

export function PeopleImpactPanel({
  title,
  rows,
  blockingRows,
  mobileSummary,
  collapsibleOnMobile = true,
}: PeopleImpactPanelProps) {
  const [expanded, setExpanded] = useState(false)

  const list = blockingRows ? (
    <dl className="divide-y divide-meeting-divider">
      {blockingRows.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-3 py-3"
        >
          <dt className="text-[14px] text-meeting-text-secondary">{row.label}</dt>
          <dd className="text-[15px] font-medium text-meeting-text">{row.value}</dd>
        </div>
      ))}
    </dl>
  ) : (
    <div>
      {rows.map((row) => (
        <ParticipantImpactRow
          key={row.participantId}
          name={row.name}
          roleLabel={row.roleLabel}
          statusLabel={row.statusLabel}
          contextLabel={row.contextLabel}
          tone={row.tone}
        />
      ))}
    </div>
  )

  return (
    <section className="min-w-0">
      <h3 className="mb-3 text-[15px] font-bold leading-[23px] text-meeting-text">
        {title}
      </h3>

      <div className="hidden min-[720px]:block">{list}</div>

      <div className="min-[720px]:hidden">
        {collapsibleOnMobile && !blockingRows ? (
          <>
            {!expanded ? (
              <>
                <p className="mb-2 text-[14px] leading-[21px] text-meeting-text-secondary">
                  {mobileSummary}
                </p>
                <TextButton
                  onClick={() => setExpanded(true)}
                  className="!min-h-10 text-[14px] underline"
                >
                  6명 상황 보기
                </TextButton>
              </>
            ) : (
              <>
                {list}
                <TextButton
                  onClick={() => setExpanded(false)}
                  className="mt-2 !min-h-10 text-[14px] underline"
                >
                  접기
                </TextButton>
              </>
            )}
          </>
        ) : (
          list
        )}
      </div>
    </section>
  )
}
