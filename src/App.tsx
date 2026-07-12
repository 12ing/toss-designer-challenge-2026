import { DecisionCard } from '@/components/DecisionCard'
import { ScreenShell } from '@/components/ui/ScreenShell'
import { TextButton } from '@/components/ui/TextButton'
import {
  confirmationScenario,
  readyScenario,
  rejectedScenario,
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

export default function App() {
  const flow = usePrototypeFlow()

  const isAttendeeView =
    flow.state === 'attendee-request' ||
    flow.state === 'attendee-approved' ||
    flow.state === 'attendee-rejected'

  const isAlternative = flow.confirmSource === 'alternative'

  const confirmView = isAlternative
    ? {
        name: rejectedScenario.targetParticipantName,
        dateDisplay: rejectedScenario.nextDateDisplay,
        timeLabel: rejectedScenario.nextTimeLabel,
        conflictLabel: rejectedScenario.conflictType,
        resultLabel: rejectedScenario.resultMessage,
        requiredAvailable: rejectedScenario.requiredAvailable,
      }
    : {
        name: confirmationScenario.targetParticipantName,
        dateDisplay: confirmationScenario.dateDisplay,
        timeLabel: confirmationScenario.timeLabel,
        conflictLabel: confirmationScenario.conflictType,
        resultLabel: confirmationScenario.resultMessage,
        requiredAvailable: confirmationScenario.requiredAvailable,
      }

  const decisionDate =
    flow.scenarioId === 'ready'
      ? readyScenario.dateDisplay
      : confirmView.dateDisplay

  const decisionTime =
    flow.scenarioId === 'ready'
      ? readyScenario.timeLabel
      : confirmView.timeLabel

  return (
    <ScreenShell
      title={isAttendeeView ? '일정 확인' : '회의 시간 잡기'}
      layout={isAttendeeView ? 'mobile' : 'desktop'}
      onClose={flow.resetToHub}
    >
      {flow.state === 'scenario-hub' && (
        <ScenarioHub onSelect={flow.selectScenario} />
      )}

      {flow.state === 'participant-setup' && (
        <ParticipantSetup
          participants={flow.participants}
          onAttendanceTypeChange={flow.setAttendanceType}
          onFindTime={flow.startAnalyzing}
        />
      )}

      {flow.state === 'analyzing' && <Analyzing />}

      {flow.state === 'ready' && (
        <DecisionCard
          state="ready"
          animateIn
          statusTitle="가장 적은 조율로 확정할 수 있어요"
          dateLabel={readyScenario.dateDisplay}
          timeLabel={readyScenario.timeLabel}
          attendance={{
            requiredAvailable: readyScenario.requiredAvailable,
            requiredTotal: readyScenario.requiredTotal,
            optionalAvailable: readyScenario.optionalAvailable,
            optionalTotal: readyScenario.optionalTotal,
          }}
          reasons={readyScenario.reasons}
          details={readyScenario.details}
          disclosureNote={readyScenario.disclosureNote}
          isReasonExpanded={flow.reasonExpanded}
          onToggleReason={flow.toggleReasonExpanded}
          onPrimaryAction={flow.goToMeetingDetails}
          onChangeConditions={flow.changeConditions}
        />
      )}

      {flow.state === 'need-confirmation' && (
        <DecisionCard
          state="need-confirmation"
          animateIn
          statusTitle="한 번의 확인으로 모두 가능해요"
          dateLabel={confirmationScenario.dateDisplay}
          timeLabel={confirmationScenario.timeLabel}
          confirmation={{
            participantName: confirmationScenario.targetParticipantName,
            conflictLabel: confirmationScenario.conflictType,
            resultLabel: confirmationScenario.resultMessage,
          }}
          supportingText="현재 가장 적은 확인이 필요한 시간이에요"
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

      {flow.state === 'waiting' && (
        <div className="flex flex-col gap-4">
          <DecisionCard
            state="waiting"
            statusTitle={`${confirmView.name} 님의 응답을 기다리고 있어요`}
            dateLabel={confirmView.dateDisplay}
            timeLabel={confirmView.timeLabel}
            waitingImpact={`현재 필수 참석자 ${confirmView.requiredAvailable}명은 가능해요`}
            supportingText="응답이 오면 다시 알려드릴게요"
            onCancelRequest={flow.cancelRequest}
            onChangeConditions={flow.changeConditions}
          />
          <div className="flex justify-center">
            <TextButton onClick={flow.openAttendeeRequest}>
              참석자 화면에서 응답하기
            </TextButton>
          </div>
        </div>
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

      {flow.state === 'ready-after-confirmation' && (
        <DecisionCard
          state="ready-after-confirmation"
          animateIn
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
        />
      )}

      {flow.state === 'next-alternative' && (
        <DecisionCard
          state="next-alternative"
          animateIn
          statusTitle={[
            '목요일 오후 3시는 조율하기 어려워요',
            '다음으로 확인이 적은 시간을 찾았어요',
          ]}
          dateLabel={rejectedScenario.nextDateDisplay}
          timeLabel={rejectedScenario.nextTimeLabel}
          confirmation={{
            participantName: rejectedScenario.targetParticipantName,
            conflictLabel: rejectedScenario.conflictType,
            resultLabel: rejectedScenario.resultMessage,
          }}
          onPrimaryAction={flow.openRequestPreview}
          onChangeConditions={flow.changeConditions}
        />
      )}

      {flow.state === 'meeting-details' && (
        <MeetingDetails
          dateDisplay={decisionDate}
          timeLabel={decisionTime}
          meeting={flow.meeting}
          onChange={flow.updateMeeting}
          onSubmit={flow.completeMeeting}
          onBack={flow.backToDecision}
        />
      )}

      {flow.state === 'completed' && (
        <Completed
          title={flow.meeting.title}
          dateDisplay={decisionDate}
          timeLabel={decisionTime}
          onClose={flow.resetToHub}
        />
      )}
    </ScreenShell>
  )
}
