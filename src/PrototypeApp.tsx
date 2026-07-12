import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DecisionCard } from '@/components/DecisionCard'
import { ReviewComplete, ReviewNav } from '@/components/ReviewShell'
import { ScreenShell } from '@/components/ui/ScreenShell'
import { shouldShowPrototypeControls } from '@/config/prototype'
import { parseScenarioParam } from '@/config/scenarios'
import {
  CONTEXT_LABEL,
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
import type { DecisionCardState } from '@/types/schedule'

const DECISION_STATES: DecisionCardState[] = [
  'ready',
  'need-confirmation',
  'waiting',
  'ready-after-confirmation',
  'next-alternative',
]

export function PrototypeApp() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const scenarioId = useMemo(
    () => parseScenarioParam(searchParams.get('scenario')),
    [searchParams],
  )
  const showReviewNav = shouldShowPrototypeControls()
  const flow = usePrototypeFlow(scenarioId)

  const isAttendeeView =
    flow.state === 'attendee-request' ||
    flow.state === 'attendee-approved' ||
    flow.state === 'attendee-rejected'

  const isAlternative = flow.confirmSource === 'alternative'
  const isDecisionSurface = DECISION_STATES.includes(
    flow.state as DecisionCardState,
  )

  const confirmView = isAlternative
    ? {
        name: rejectedScenario.targetParticipantName,
        dateDisplay: rejectedScenario.nextDateDisplay,
        timeLabel: rejectedScenario.nextTimeLabel,
        conflictLabel: rejectedScenario.conflictType,
        resultLabel: rejectedScenario.resultMessage,
        details: rejectedScenario.details,
        disclosureNote: rejectedScenario.disclosureNote,
      }
    : {
        name: confirmationScenario.targetParticipantName,
        dateDisplay: confirmationScenario.dateDisplay,
        timeLabel: confirmationScenario.timeLabel,
        conflictLabel: confirmationScenario.conflictType,
        resultLabel: confirmationScenario.resultMessage,
        details: confirmationScenario.details,
        disclosureNote: confirmationScenario.disclosureNote,
      }

  const usesReadySlot = flow.scenarioId === 'ready' || flow.state === 'ready'
  const decisionState = flow.state as DecisionCardState
  const goHome = () => navigate('/')

  if (flow.state === 'review-complete') {
    return <ReviewComplete />
  }

  return (
    <ScreenShell
      title={isAttendeeView ? '일정 확인' : '회의 시간 잡기'}
      layout={isAttendeeView ? 'mobile' : 'desktop'}
      onClose={goHome}
      footer={
        !isAttendeeView ? (
          <ReviewNav
            visible={showReviewNav}
            state={flow.state}
            scenarioId={flow.scenarioId}
            onOpenAttendee={flow.openAttendeeRequest}
          />
        ) : undefined
      }
    >
      {flow.state === 'participant-setup' && (
        <ParticipantSetup
          participants={flow.participants}
          editable={false}
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
          statusTitle="바로 확정할 수 있어요."
          dateLabel={readyScenario.dateDisplay}
          timeLabel={readyScenario.timeLabel}
          attendance={{
            requiredAvailable: readyScenario.requiredAvailable,
            requiredTotal: readyScenario.requiredTotal,
            optionalAvailable: readyScenario.optionalAvailable,
            optionalTotal: readyScenario.optionalTotal,
          }}
          details={readyScenario.details}
          disclosureNote={readyScenario.disclosureNote}
          isReasonExpanded={flow.reasonExpanded}
          onToggleReason={flow.toggleReasonExpanded}
          onPrimaryAction={flow.goToMeetingDetails}
        />
      )}

      {isDecisionSurface && decisionState === 'need-confirmation' && (
        <DecisionCard
          state="need-confirmation"
          contextLabel={CONTEXT_LABEL}
          animateIn={flow.playCardEnter}
          onAnimateInEnd={flow.acknowledgeCardEnter}
          statusTitle="확인 한 번이면 필수 참석자 모두 가능해요."
          dateLabel={confirmationScenario.dateDisplay}
          timeLabel={confirmationScenario.timeLabel}
          confirmation={{
            participantName: confirmationScenario.targetParticipantName,
            conflictLabel: confirmationScenario.conflictType,
            resultLabel: confirmationScenario.resultMessage,
          }}
          details={confirmationScenario.details}
          disclosureNote={confirmationScenario.disclosureNote}
          isReasonExpanded={flow.reasonExpanded}
          onToggleReason={flow.toggleReasonExpanded}
          onPrimaryAction={flow.openRequestPreview}
        />
      )}

      {isDecisionSurface && decisionState === 'waiting' && (
        <DecisionCard
          state="waiting"
          contextLabel={CONTEXT_LABEL}
          statusTitle="응답을 기다리고 있어요."
          dateLabel={confirmView.dateDisplay}
          timeLabel={confirmView.timeLabel}
          supportingText="확인되면 회의를 확정할 수 있는지 알려드릴게요."
          confirmationMeta={`확인 대상 · ${confirmView.name}`}
        />
      )}

      {isDecisionSurface && decisionState === 'ready-after-confirmation' && (
        <DecisionCard
          state="ready-after-confirmation"
          contextLabel={CONTEXT_LABEL}
          statusTitle="바로 확정할 수 있어요."
          dateLabel={confirmView.dateDisplay}
          timeLabel={confirmView.timeLabel}
          attendance={{
            requiredAvailable: 4,
            requiredTotal: 4,
            optionalAvailable: 2,
            optionalTotal: 2,
          }}
          onPrimaryAction={flow.goToMeetingDetails}
        />
      )}

      {isDecisionSurface && decisionState === 'next-alternative' && (
        <DecisionCard
          state="next-alternative"
          contextLabel={CONTEXT_LABEL}
          animateIn={flow.playCardEnter}
          onAnimateInEnd={flow.acknowledgeCardEnter}
          statusTitle="다음으로 조율이 적은 시간을 찾았어요."
          dateLabel={rejectedScenario.nextDateDisplay}
          timeLabel={rejectedScenario.nextTimeLabel}
          confirmation={{
            participantName: rejectedScenario.targetParticipantName,
            conflictLabel: rejectedScenario.conflictType,
            resultLabel: rejectedScenario.resultMessage,
          }}
          details={rejectedScenario.details}
          disclosureNote={rejectedScenario.disclosureNote}
          footnote="이전 시간은 일정 확인이 어려워 제외했어요."
          isReasonExpanded={flow.reasonExpanded}
          onToggleReason={flow.toggleReasonExpanded}
          onPrimaryAction={flow.openRequestPreview}
        />
      )}

      {flow.state === 'request-preview' && (
        <RequestPreview
          recipientName={confirmView.name}
          dateDisplay={confirmView.dateDisplay}
          timeLabel={confirmView.timeLabel}
          loading={flow.isSendingRequest}
          onSend={flow.sendRequest}
          onBack={flow.backFromPreview}
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
            usesReadySlot ? readyScenario.dateDisplay : confirmView.dateDisplay
          }
          timeLabel={
            usesReadySlot ? readyScenario.timeLabel : confirmView.timeLabel
          }
          meeting={flow.meeting}
          onChange={flow.updateMeeting}
          onSubmit={flow.completeMeeting}
          onBack={flow.backToDecision}
        />
      )}

      {flow.state === 'completed' && (
        <Completed
          title={flow.meeting.title}
          dateDisplay={
            usesReadySlot ? readyScenario.dateDisplay : confirmView.dateDisplay
          }
          timeLabel={
            usesReadySlot ? readyScenario.timeLabel : confirmView.timeLabel
          }
          onComplete={flow.finishReview}
        />
      )}
    </ScreenShell>
  )
}
