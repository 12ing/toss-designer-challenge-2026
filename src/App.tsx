import { useState } from 'react'
import { DecisionCard } from '@/components/DecisionCard'
import { ScreenShell } from '@/components/ui/ScreenShell'
import { TextButton } from '@/components/ui/TextButton'
import { shouldShowPrototypeControls } from '@/config/prototype'
import {
  CONTEXT_LABEL,
  confirmationScenario,
  readyScenario,
  rejectedScenario,
  revisedReadyScenario,
} from '@/data/scenarios'
import { usePrototypeFlow } from '@/hooks/usePrototypeFlow'
import { Analyzing } from '@/screens/Analyzing'
import { AttendeeRequest } from '@/screens/AttendeeRequest'
import { AttendeeResult } from '@/screens/AttendeeResult'
import { Completed } from '@/screens/Completed'
import { MeetingDetails } from '@/screens/MeetingDetails'
import { ParticipantSetup } from '@/screens/ParticipantSetup'
import { RequestPreview } from '@/screens/RequestPreview'
import { ScenarioHub } from '@/screens/ScenarioHub'
import type { DecisionCardState } from '@/types/schedule'

const DECISION_STATES: DecisionCardState[] = [
  'ready',
  'need-confirmation',
  'waiting',
  'ready-after-confirmation',
  'next-alternative',
]

export default function App() {
  const flow = usePrototypeFlow()
  const [showPrototypeControls] = useState(shouldShowPrototypeControls)
  const [completedDone, setCompletedDone] = useState(false)

  const isAttendeeView =
    flow.state === 'attendee-request' ||
    flow.state === 'attendee-approved' ||
    flow.state === 'attendee-rejected'

  const isAlternative = flow.confirmSource === 'alternative'
  const isDecisionSurface = DECISION_STATES.includes(
    flow.state as DecisionCardState,
  )

  const readyData = flow.isRevisedRecommendation
    ? revisedReadyScenario
    : readyScenario

  const confirmView = isAlternative
    ? {
        name: rejectedScenario.targetParticipantName,
        dateDisplay: rejectedScenario.nextDateDisplay,
        timeLabel: rejectedScenario.nextTimeLabel,
        conflictLabel: rejectedScenario.conflictType,
        resultLabel: rejectedScenario.resultMessage,
        reasonSummary: rejectedScenario.reasonSummary,
        details: rejectedScenario.details,
        disclosureNote: rejectedScenario.disclosureNote,
      }
    : {
        name: confirmationScenario.targetParticipantName,
        dateDisplay: confirmationScenario.dateDisplay,
        timeLabel: confirmationScenario.timeLabel,
        conflictLabel: confirmationScenario.conflictType,
        resultLabel: confirmationScenario.resultMessage,
        reasonSummary: confirmationScenario.reasonSummary,
        details: confirmationScenario.details,
        disclosureNote: confirmationScenario.disclosureNote,
      }

  const usesReadySlot =
    flow.isRevisedRecommendation ||
    flow.scenarioId === 'ready' ||
    flow.state === 'ready'

  const decisionState = flow.state as DecisionCardState

  return (
    <ScreenShell
      title={isAttendeeView ? '일정 확인' : '회의 시간 잡기'}
      layout={isAttendeeView ? 'mobile' : 'desktop'}
      onClose={flow.resetToHub}
    >
      {flow.state === 'scenario-hub' && (
        <ScenarioHub
          onSelect={(id) => {
            setCompletedDone(false)
            flow.selectScenario(id)
          }}
        />
      )}

      {flow.state === 'participant-setup' && (
        <ParticipantSetup
          participants={flow.participants}
          onAttendanceTypeChange={flow.setAttendanceType}
          onFindTime={flow.startAnalyzing}
        />
      )}

      {flow.state === 'analyzing' && <Analyzing />}

      {isDecisionSurface && decisionState === 'ready' && (
        <DecisionCard
          state="ready"
          contextLabel={CONTEXT_LABEL}
          animateIn={flow.playCardEnter}
          onAnimateInEnd={flow.acknowledgeCardEnter}
          statusTitle={
            flow.isRevisedRecommendation
              ? '조건을 반영해 새로운 시간을 찾았어요'
              : '가장 적은 조율로 확정할 수 있어요'
          }
          dateLabel={readyData.dateDisplay}
          timeLabel={readyData.timeLabel}
          attendance={{
            requiredAvailable: readyData.requiredAvailable,
            requiredTotal: readyData.requiredTotal,
            optionalAvailable: readyData.optionalAvailable,
            optionalTotal: readyData.optionalTotal,
          }}
          reasons={readyData.reasons}
          details={readyData.details}
          disclosureNote={readyData.disclosureNote}
          isReasonExpanded={flow.reasonExpanded}
          onToggleReason={flow.toggleReasonExpanded}
          onPrimaryAction={flow.goToMeetingDetails}
          onChangeConditions={flow.changeConditions}
        />
      )}

      {isDecisionSurface && decisionState === 'need-confirmation' && (
        <DecisionCard
          state="need-confirmation"
          contextLabel={CONTEXT_LABEL}
          animateIn={flow.playCardEnter}
          onAnimateInEnd={flow.acknowledgeCardEnter}
          statusTitle="한 번의 확인으로 모두 가능해요"
          dateLabel={confirmationScenario.dateDisplay}
          timeLabel={confirmationScenario.timeLabel}
          confirmation={{
            participantName: confirmationScenario.targetParticipantName,
            conflictLabel: confirmationScenario.conflictType,
            resultLabel: confirmationScenario.resultMessage,
          }}
          reasonSummary={confirmationScenario.reasonSummary}
          details={confirmationScenario.details}
          disclosureNote={confirmationScenario.disclosureNote}
          supportingText="현재 가장 적은 확인이 필요한 시간이에요"
          isReasonExpanded={flow.reasonExpanded}
          onToggleReason={flow.toggleReasonExpanded}
          onPrimaryAction={flow.openRequestPreview}
          onChangeConditions={flow.changeConditions}
        />
      )}

      {isDecisionSurface && decisionState === 'waiting' && (
        <div className="flex flex-col gap-4">
          <DecisionCard
            state="waiting"
            contextLabel={CONTEXT_LABEL}
            statusTitle={`${confirmView.name} 님의 응답을 기다리고 있어요`}
            dateLabel={confirmView.dateDisplay}
            timeLabel={confirmView.timeLabel}
            supportingText="응답이 오면 확정할 수 있는지 다시 알려드릴게요."
            onCancelRequest={flow.cancelRequest}
            onChangeConditions={flow.changeConditions}
          />
          {showPrototypeControls && (
            <div className="mx-auto w-full max-w-[560px] rounded-xl border border-dashed border-meeting-divider px-4 py-3">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-meeting-text-tertiary">
                Prototype only
              </p>
              <TextButton
                onClick={flow.openAttendeeRequest}
                className="!min-h-9 text-[13px] text-meeting-text-tertiary underline"
              >
                참석자 화면에서 응답하기
              </TextButton>
            </div>
          )}
        </div>
      )}

      {isDecisionSurface && decisionState === 'ready-after-confirmation' && (
        <DecisionCard
          state="ready-after-confirmation"
          contextLabel={CONTEXT_LABEL}
          statusTitle="이제 확정할 수 있어요"
          dateLabel={confirmView.dateDisplay}
          timeLabel={confirmView.timeLabel}
          attendance={{
            requiredAvailable: 4,
            requiredTotal: 4,
            optionalAvailable: 2,
            optionalTotal: 2,
          }}
          supportingText="필요한 일정 확인이 끝났어요"
          onPrimaryAction={flow.goToMeetingDetails}
          onChangeConditions={flow.changeConditions}
        />
      )}

      {isDecisionSurface && decisionState === 'next-alternative' && (
        <DecisionCard
          state="next-alternative"
          contextLabel={CONTEXT_LABEL}
          animateIn={flow.playCardEnter}
          onAnimateInEnd={flow.acknowledgeCardEnter}
          statusTitle="다음으로 조율이 적은 시간을 찾았어요"
          dateLabel={rejectedScenario.nextDateDisplay}
          timeLabel={rejectedScenario.nextTimeLabel}
          confirmation={{
            participantName: rejectedScenario.targetParticipantName,
            conflictLabel: rejectedScenario.conflictType,
            resultLabel: rejectedScenario.resultMessage,
          }}
          reasonSummary={rejectedScenario.reasonSummary}
          details={rejectedScenario.details}
          disclosureNote={rejectedScenario.disclosureNote}
          footnote="이전 시간은 일정 확인이 어려워 제외했어요"
          isReasonExpanded={flow.reasonExpanded}
          onToggleReason={flow.toggleReasonExpanded}
          onPrimaryAction={flow.openRequestPreview}
          onChangeConditions={flow.changeConditions}
        />
      )}

      {flow.state === 'request-preview' && (
        <RequestPreview
          recipientName={confirmView.name}
          dateDisplay={confirmView.dateDisplay}
          timeLabel={confirmView.timeLabel}
          loading={flow.isSendingRequest}
          onSend={flow.sendRequest}
          onBack={flow.cancelRequest}
        />
      )}

      {flow.state === 'attendee-request' && (
        <AttendeeRequest
          dateDisplay={confirmView.dateDisplay}
          timeLabel={confirmView.timeLabel}
          loading={flow.isResponding}
          onApprove={flow.approveRequest}
          onReject={flow.rejectRequest}
        />
      )}

      {flow.state === 'attendee-approved' && (
        <AttendeeResult approved onConfirm={flow.finishAttendeeApproved} />
      )}

      {flow.state === 'attendee-rejected' && (
        <AttendeeResult
          approved={false}
          onConfirm={flow.finishAttendeeRejected}
        />
      )}

      {flow.state === 'meeting-details' && (
        <MeetingDetails
          dateDisplay={
            usesReadySlot ? readyData.dateDisplay : confirmView.dateDisplay
          }
          timeLabel={
            usesReadySlot ? readyData.timeLabel : confirmView.timeLabel
          }
          meeting={flow.meeting}
          onChange={flow.updateMeeting}
          onSubmit={() => {
            setCompletedDone(false)
            flow.completeMeeting()
          }}
          onBack={flow.backToDecision}
        />
      )}

      {flow.state === 'completed' && (
        <Completed
          title={flow.meeting.title}
          dateDisplay={
            usesReadySlot ? readyData.dateDisplay : confirmView.dateDisplay
          }
          timeLabel={
            usesReadySlot ? readyData.timeLabel : confirmView.timeLabel
          }
          onComplete={() => setCompletedDone(true)}
          onBackToScenarios={flow.resetToHub}
          showDoneMessage={completedDone}
        />
      )}
    </ScreenShell>
  )
}
