import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DecisionCard } from '@/components/DecisionCard'
import { ReviewComplete, ReviewNav } from '@/components/ReviewShell'
import { ScreenShell } from '@/components/ui/ScreenShell'
import { shouldShowPrototypeControls } from '@/config/prototype'
import { parseScenarioParam } from '@/config/scenarios'
import { CONTEXT_LABEL } from '@/features/meeting-decision/mappers/to-ui'
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

  const isDecisionSurface = DECISION_STATES.includes(
    flow.state as DecisionCardState,
  )
  const decisionState = flow.state as DecisionCardState
  const view = flow.uiView
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
          editable
          onAttendanceTypeChange={flow.setAttendanceType}
          onFindTime={flow.startAnalyzing}
        />
      )}

      {flow.state === 'analyzing' && <Analyzing />}

      {flow.state === 'no-option' && view?.blockingSummary && (
        <div className="mx-auto w-full max-w-[560px] rounded-[var(--meeting-radius-card)] bg-meeting-surface p-8 shadow-[var(--meeting-shadow)]">
          <h2
            className="text-[22px] font-bold leading-8 text-meeting-text"
            style={{ wordBreak: 'keep-all' }}
          >
            {view.blockingSummary}
          </h2>
        </div>
      )}

      {isDecisionSurface && view && decisionState === 'ready' && (
        <DecisionCard
          state="ready"
          contextLabel={CONTEXT_LABEL}
          animateIn={flow.playCardEnter}
          onAnimateInEnd={flow.acknowledgeCardEnter}
          statusTitle="바로 확정할 수 있어요."
          dateLabel={view.dateLabel}
          timeLabel={view.timeLabel}
          attendance={{
            requiredAvailable: view.requiredAvailable,
            requiredTotal: view.requiredTotal,
            optionalAvailable: view.optionalAvailable,
            optionalTotal: view.optionalTotal,
          }}
          details={view.details}
          disclosureNote={view.disclosureNote}
          isReasonExpanded={flow.reasonExpanded}
          onToggleReason={flow.toggleReasonExpanded}
          onPrimaryAction={flow.goToMeetingDetails}
        />
      )}

      {isDecisionSurface && view && decisionState === 'need-confirmation' && (
        <DecisionCard
          state="need-confirmation"
          contextLabel={CONTEXT_LABEL}
          animateIn={flow.playCardEnter}
          onAnimateInEnd={flow.acknowledgeCardEnter}
          statusTitle="확인 한 번이면 필수 참석자 모두 가능해요."
          dateLabel={view.dateLabel}
          timeLabel={view.timeLabel}
          confirmation={
            view.confirmation
              ? {
                  participantName: view.confirmation.participantName,
                  conflictLabel: view.confirmation.conflictLabel,
                  resultLabel: view.confirmation.resultLabel,
                }
              : undefined
          }
          details={view.details}
          disclosureNote={view.disclosureNote}
          isReasonExpanded={flow.reasonExpanded}
          onToggleReason={flow.toggleReasonExpanded}
          onPrimaryAction={flow.openRequestPreview}
        />
      )}

      {isDecisionSurface && view && decisionState === 'waiting' && (
        <DecisionCard
          state="waiting"
          contextLabel={CONTEXT_LABEL}
          statusTitle="응답을 기다리고 있어요."
          dateLabel={view.dateLabel}
          timeLabel={view.timeLabel}
          supportingText="확인되면 회의를 확정할 수 있는지 알려드릴게요."
          confirmationMeta={
            view.confirmation
              ? `확인 대상 · ${view.confirmation.participantName}`
              : undefined
          }
        />
      )}

      {isDecisionSurface &&
        view &&
        decisionState === 'ready-after-confirmation' && (
          <DecisionCard
            state="ready-after-confirmation"
            contextLabel={CONTEXT_LABEL}
            statusTitle="바로 확정할 수 있어요."
            dateLabel={view.dateLabel}
            timeLabel={view.timeLabel}
            attendance={{
              requiredAvailable: view.requiredAvailable,
              requiredTotal: view.requiredTotal,
              optionalAvailable: view.optionalAvailable,
              optionalTotal: view.optionalTotal,
            }}
            onPrimaryAction={flow.goToMeetingDetails}
          />
        )}

      {isDecisionSurface && view && decisionState === 'next-alternative' && (
        <DecisionCard
          state="next-alternative"
          contextLabel={CONTEXT_LABEL}
          animateIn={flow.playCardEnter}
          onAnimateInEnd={flow.acknowledgeCardEnter}
          statusTitle="다음으로 조율이 적은 시간을 찾았어요."
          dateLabel={view.dateLabel}
          timeLabel={view.timeLabel}
          confirmation={
            view.confirmation
              ? {
                  participantName: view.confirmation.participantName,
                  conflictLabel: view.confirmation.conflictLabel,
                  resultLabel: view.confirmation.resultLabel,
                }
              : undefined
          }
          details={view.details}
          disclosureNote={view.disclosureNote}
          footnote="이전 시간은 일정 확인이 어려워 제외했어요."
          isReasonExpanded={flow.reasonExpanded}
          onToggleReason={flow.toggleReasonExpanded}
          onPrimaryAction={flow.openRequestPreview}
        />
      )}

      {flow.state === 'request-preview' && view?.confirmation && (
        <RequestPreview
          recipientName={view.confirmation.participantName}
          dateDisplay={view.dateLabel}
          timeLabel={view.timeLabel}
          loading={flow.isSendingRequest}
          onSend={flow.sendRequest}
          onBack={flow.backFromPreview}
        />
      )}

      {flow.state === 'attendee-request' && view && (
        <AttendeeRequest
          dateDisplay={view.dateLabel}
          timeLabel={view.timeLabel}
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

      {flow.state === 'meeting-details' && view && (
        <MeetingDetails
          dateDisplay={view.dateLabel}
          timeLabel={view.timeLabel}
          meeting={flow.meeting}
          onChange={flow.updateMeeting}
          onSubmit={flow.completeMeeting}
          onBack={flow.backToDecision}
        />
      )}

      {flow.state === 'completed' && view && (
        <Completed
          title={flow.meeting.title}
          dateDisplay={view.dateLabel}
          timeLabel={view.timeLabel}
          onComplete={flow.finishReview}
        />
      )}
    </ScreenShell>
  )
}
