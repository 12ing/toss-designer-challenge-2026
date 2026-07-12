import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DecisionSurface } from '@/components/decision-surface/DecisionSurface'
import { ReviewComplete, ReviewNav } from '@/components/ReviewShell'
import { ScreenShell } from '@/components/ui/ScreenShell'
import { shouldShowPrototypeControls } from '@/config/prototype'
import { parseScenarioParam } from '@/config/scenarios'
import type { DecisionSurfaceMode } from '@/features/meeting-decision/view-model/decision-surface.mapper'
import { usePrototypeFlow } from '@/hooks/usePrototypeFlow'
import { Analyzing } from '@/screens/Analyzing'
import { AttendeeRequest } from '@/screens/AttendeeRequest'
import { AttendeeResult } from '@/screens/AttendeeResult'
import { Completed } from '@/screens/Completed'
import { MeetingDetails } from '@/screens/MeetingDetails'
import { ParticipantSetup } from '@/screens/ParticipantSetup'
import { RequestPreview } from '@/screens/RequestPreview'

const SURFACE_STATES = new Set([
  'ready',
  'need-confirmation',
  'waiting',
  'ready-after-confirmation',
  'next-alternative',
  'no-option',
])

function toSurfaceMode(state: string): DecisionSurfaceMode | null {
  if (!SURFACE_STATES.has(state)) return null
  return state as DecisionSurfaceMode
}

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

  const surfaceMode = toSurfaceMode(flow.state)
  const showSurface = surfaceMode !== null && flow.recommendation !== null
  const goHome = () => navigate('/')

  const onPrimary = () => {
    if (!surfaceMode || !flow.recommendation) return
    if (surfaceMode === 'no-option') {
      flow.changeConditions()
      return
    }
    if (
      surfaceMode === 'ready' ||
      surfaceMode === 'ready-after-confirmation' ||
      (surfaceMode === 'next-alternative' &&
        flow.recommendation.status === 'READY')
    ) {
      flow.goToMeetingDetails()
      return
    }
    flow.openRequestPreview()
  }

  if (flow.state === 'review-complete') {
    return <ReviewComplete />
  }

  return (
    <ScreenShell
      title={isAttendeeView ? '일정 확인' : '회의 시간 잡기'}
      layout={isAttendeeView ? 'mobile' : 'desktop'}
      contentWidth={showSurface ? 'wide' : 'default'}
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
          attendanceTypes={flow.attendanceTypes}
          onAttendanceTypeChange={flow.setAttendanceType}
          onFindTime={flow.startAnalyzing}
        />
      )}

      {flow.state === 'analyzing' && <Analyzing />}

      {showSurface && surfaceMode && flow.recommendation && (
        <DecisionSurface
          mode={surfaceMode}
          recommendation={flow.recommendation}
          isReasonExpanded={flow.reasonExpanded}
          onToggleReason={
            surfaceMode === 'waiting' || surfaceMode === 'no-option'
              ? undefined
              : flow.toggleReasonExpanded
          }
          onPrimaryAction={
            surfaceMode === 'waiting' ? undefined : onPrimary
          }
          animateIn={flow.playCardEnter}
          onAnimateInEnd={flow.acknowledgeCardEnter}
        />
      )}

      {flow.state === 'request-preview' && flow.uiView?.confirmation && (
        <RequestPreview
          recipientName={flow.uiView.confirmation.participantName}
          dateDisplay={flow.uiView.dateLabel}
          timeLabel={flow.uiView.timeLabel}
          loading={flow.isSendingRequest}
          onSend={flow.sendRequest}
          onBack={flow.backFromPreview}
        />
      )}

      {flow.state === 'attendee-request' && flow.uiView && (
        <AttendeeRequest
          dateDisplay={flow.uiView.dateLabel}
          timeLabel={flow.uiView.timeLabel}
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

      {flow.state === 'meeting-details' && flow.uiView && (
        <MeetingDetails
          dateDisplay={flow.uiView.dateLabel}
          timeLabel={flow.uiView.timeLabel}
          meeting={flow.meeting}
          onChange={flow.updateMeeting}
          onSubmit={flow.completeMeeting}
          onBack={flow.backToDecision}
        />
      )}

      {flow.state === 'completed' && flow.uiView && (
        <Completed
          title={flow.meeting.title}
          dateDisplay={flow.uiView.dateLabel}
          timeLabel={flow.uiView.timeLabel}
          onComplete={flow.finishReview}
        />
      )}
    </ScreenShell>
  )
}
