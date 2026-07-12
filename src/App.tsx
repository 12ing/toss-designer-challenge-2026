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
        requiredAvailable: rejectedScenario.requiredAvailable,
      }
    : {
        name: confirmationScenario.targetParticipantName,
        dateDisplay: confirmationScenario.dateDisplay,
        timeLabel: confirmationScenario.timeLabel,
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
          variant="ready"
          animateIn
          stateMessage="가장 적은 조율로 확정할 수 있는 시간이에요."
          dateDisplay={readyScenario.dateDisplay}
          timeLabel={readyScenario.timeLabel}
          requiredText={`꼭 참석해야 하는 ${readyScenario.requiredTotal}명 모두 가능해요.`}
          optionalText={`참석하면 좋은 ${readyScenario.optionalTotal}명 중 ${readyScenario.optionalAvailable}명이 가능해요.`}
          reasons={readyScenario.reasons}
          details={readyScenario.details}
          disclosureNote={readyScenario.disclosureNote}
          primaryCtaText="이 시간으로 확정"
          onPrimaryCta={flow.goToMeetingDetails}
          showReasonDisclosure
          reasonExpanded={flow.reasonExpanded}
          onToggleReason={flow.toggleReasonExpanded}
          onChangeConditions={flow.changeConditions}
        />
      )}

      {flow.state === 'need-confirmation' && (
        <DecisionCard
          variant="need-confirmation"
          animateIn
          stateMessage="한 번의 확인으로 모두 가능한 시간을 만들 수 있어요."
          dateDisplay={confirmationScenario.dateDisplay}
          timeLabel={confirmationScenario.timeLabel}
          confirmationRequirement={`${confirmationScenario.targetParticipantName} 님의 ${confirmationScenario.conflictType}을 사용할 수 있는지 확인해야 해요.`}
          resultMessage={confirmationScenario.resultMessage}
          primaryCtaText="가능 여부 묻기"
          onPrimaryCta={flow.openRequestPreview}
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
            variant="waiting"
            stateMessage={`${confirmView.name} 님의 응답을 기다리고 있어요.`}
            dateDisplay={confirmView.dateDisplay}
            timeLabel={confirmView.timeLabel}
            requiredText={`현재 꼭 참석해야 하는 ${confirmView.requiredAvailable}명은 가능해요.`}
            optionalText="응답이 오면 확정할 수 있는지 다시 알려드릴게요."
            primaryCtaText=""
            onPrimaryCta={() => undefined}
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
          conflictType="개인 업무 시간"
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
          variant="ready-after-confirmation"
          animateIn
          stateMessage="이제 확정할 수 있어요."
          dateDisplay={confirmView.dateDisplay}
          timeLabel={confirmView.timeLabel}
          requiredText="꼭 참석해야 하는 4명 모두 가능해요."
          optionalText="참석하면 좋은 2명도 모두 가능해요."
          helperText="필요한 일정 확인이 끝났어요."
          primaryCtaText="이 시간으로 확정"
          onPrimaryCta={flow.goToMeetingDetails}
        />
      )}

      {flow.state === 'next-alternative' && (
        <DecisionCard
          variant="next-alternative"
          animateIn
          stateMessage={[
            '목요일 오후 3시는 조율하기 어려워요.',
            '다음으로 확인이 적은 시간을 찾았어요.',
          ]}
          dateDisplay={rejectedScenario.nextDateDisplay}
          timeLabel={rejectedScenario.nextTimeLabel}
          confirmationRequirement={`${rejectedScenario.targetParticipantName} 님의 ${rejectedScenario.conflictType}을 사용할 수 있는지 확인해야 해요.`}
          resultMessage={rejectedScenario.resultMessage}
          primaryCtaText="가능 여부 묻기"
          onPrimaryCta={flow.openRequestPreview}
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
