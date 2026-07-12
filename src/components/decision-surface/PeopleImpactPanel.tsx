import { useId, useState } from 'react'
import { ParticipantImpactRow } from '@/components/decision-surface/ParticipantImpactRow'
import { TextButton } from '@/components/ui/TextButton'
import type { ParticipantImpactViewModel } from '@/features/meeting-decision/view-model/decision-surface.mapper'

type PeopleImpactPanelProps = {
  title: string
  requiredRows: ParticipantImpactViewModel[]
  optionalRows: ParticipantImpactViewModel[]
  blockingRows?: Array<{ label: string; value: string }>
  mobileSummary: string
  mobileConfirmationHint?: string
  collapsibleOnMobile?: boolean
}

function GroupedList({
  requiredRows,
  optionalRows,
  requiredHeadingId,
  optionalHeadingId,
}: {
  requiredRows: ParticipantImpactViewModel[]
  optionalRows: ParticipantImpactViewModel[]
  requiredHeadingId: string
  optionalHeadingId: string
}) {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby={requiredHeadingId}>
        <h4
          id={requiredHeadingId}
          className="mb-1 text-[13px] font-bold leading-5 text-meeting-text-secondary"
        >
          필수 참석자 {requiredRows.length}명
        </h4>
        <div>
          {requiredRows.map((row) => (
            <ParticipantImpactRow
              key={row.participantId}
              name={row.name}
              statusLabel={row.statusLabel}
              contextLabel={row.contextLabel}
              tone={row.tone}
              isConfirmationTarget={row.isConfirmationTarget}
              accessibleLabel={row.accessibleLabel}
            />
          ))}
        </div>
      </section>

      {optionalRows.length > 0 ? (
        <section aria-labelledby={optionalHeadingId}>
          <h4
            id={optionalHeadingId}
            className="mb-1 text-[13px] font-bold leading-5 text-meeting-text-secondary"
          >
            선택 참석자 {optionalRows.length}명
          </h4>
          <div>
            {optionalRows.map((row) => (
              <ParticipantImpactRow
                key={row.participantId}
                name={row.name}
                statusLabel={row.statusLabel}
                contextLabel={row.contextLabel}
                tone={row.tone}
                isConfirmationTarget={row.isConfirmationTarget}
                accessibleLabel={row.accessibleLabel}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export function PeopleImpactPanel({
  title,
  requiredRows,
  optionalRows,
  blockingRows,
  mobileSummary,
  mobileConfirmationHint,
  collapsibleOnMobile = true,
}: PeopleImpactPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const requiredHeadingId = useId()
  const optionalHeadingId = useId()

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
    <GroupedList
      requiredRows={requiredRows}
      optionalRows={optionalRows}
      requiredHeadingId={requiredHeadingId}
      optionalHeadingId={optionalHeadingId}
    />
  )

  const mobileSummaryLines = mobileSummary.split('\n')

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
                <div className="mb-2 flex flex-col gap-1">
                  {mobileSummaryLines.map((line) => (
                    <p
                      key={line}
                      className="text-[14px] leading-[21px] text-meeting-text-secondary"
                    >
                      {line}
                    </p>
                  ))}
                  {mobileConfirmationHint ? (
                    <p className="text-[14px] font-medium leading-[21px] text-meeting-text">
                      {mobileConfirmationHint}
                    </p>
                  ) : null}
                </div>
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
