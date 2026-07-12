import { useMemo } from 'react'
import { DecisionPreview } from '@/review/components/DecisionPreview'
import { candidateSlots } from '@/features/meeting-decision/data/candidate-slots'
import { decisionParticipants } from '@/features/meeting-decision/data/participants'
import { getScenarioPreset } from '@/features/meeting-decision/data/scenario-presets'
import { recommendMeeting } from '@/features/meeting-decision/engine/decision-engine'

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

  return (
    <div className="pointer-events-none select-none">
      <DecisionPreview recommendation={recommendation} />
    </div>
  )
}
