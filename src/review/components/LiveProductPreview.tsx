import { useMemo } from 'react'
import { DecisionSurface } from '@/components/decision-surface/DecisionSurface'
import { candidateSlots } from '@/features/meeting-decision/data/candidate-slots'
import { decisionParticipants } from '@/features/meeting-decision/data/participants'
import { getScenarioPreset } from '@/features/meeting-decision/data/scenario-presets'
import { recommendMeeting } from '@/features/meeting-decision/engine/decision-engine'
import { surfaceFromRecommendation } from '@/features/meeting-decision/mappers/to-ui'

export function LiveProductPreview() {
  const recommendation = useMemo(
    () =>
      recommendMeeting({
        participants: decisionParticipants,
        candidateSlots,
        attendanceTypes: getScenarioPreset('coordination').attendanceTypes,
        responseOverrides: {},
      }),
    [],
  )

  const mode = surfaceFromRecommendation(recommendation)

  return (
    <aside className="min-w-0" aria-label="핵심 경험 미리보기">
      <p className="mb-3 text-[13px] font-medium leading-5 text-meeting-text-tertiary">
        핵심 경험 미리보기
      </p>
      <div className="pointer-events-none select-none overflow-hidden rounded-[28px] border border-meeting-divider bg-meeting-panel/40 p-3 shadow-[0_16px_40px_rgba(0,27,55,0.08)] max-[899px]:p-2">
        <div className="origin-top scale-[0.92] max-[899px]:scale-100 [&_article]:mx-0 [&_article]:shadow-none">
          <DecisionSurface
            mode={mode}
            recommendation={recommendation}
            isReasonExpanded={false}
          />
        </div>
      </div>
    </aside>
  )
}
