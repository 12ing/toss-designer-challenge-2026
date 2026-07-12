import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DecisionSurface } from '@/components/decision-surface/DecisionSurface'
import { ReviewComplete, ReviewNav } from '@/components/ReviewShell'
import { ScreenShell } from '@/components/ui/ScreenShell'
import { shouldShowPrototypeControls } from '@/config/prototype'
import { parseScenarioParam } from '@/config/scenarios'
import {
  findSessionByRequestId,
  loadSession,
} from '@/features/meeting-decision/connected-flow/connected-flow.persistence'
import { usePrototypeFlow } from '@/hooks/usePrototypeFlow'
import { Analyzing } from '@/screens/Analyzing'
import { AttendeeRequest } from '@/screens/AttendeeRequest'
import { AttendeeResult } from '@/screens/AttendeeResult'
import { AttendeeReviewTransition } from '@/screens/AttendeeReviewTransition'
import { Completed } from '@/screens/Completed'
import { MeetingDetails } from '@/screens/MeetingDetails'
import { ParticipantSetup } from '@/screens/ParticipantSetup'
import { RequestPreview } from '@/screens/RequestPreview'

function useScenarioId() {
  const [searchParams] = useSearchParams()
  return useMemo(
    () => parseScenarioParam(searchParams.get('scenario')),
    [searchParams],
  )
}

type FlowApi = ReturnType<typeof usePrototypeFlow>

export function PrototypeApp() {
  const navigate = useNavigate()
  const scenarioId = useScenarioId()
  const flow = usePrototypeFlow(scenarioId)

  useEffect(() => {
    if (!flow.sessionId) return
    navigate(
      `/prototype/session/${flow.sessionId}/organizer${window.location.search}`,
      { replace: true },
    )
  }, [flow.sessionId, navigate])

  return null
}

export function OrganizerSessionApp() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const scenarioId = useScenarioId()
  const showReviewNav = shouldShowPrototypeControls()
  const flow = usePrototypeFlow(scenarioId)

  useEffect(() => {
    const stored = loadSession()
    if (sessionId && stored && stored.id !== sessionId) {
      navigate(
        `/prototype/session/${stored.id}/organizer${window.location.search}`,
        { replace: true },
      )
    }
  }, [sessionId, navigate])

  useEffect(() => {
    if (
      flow.state === 'attendee-request' ||
      flow.state === 'attendee-approved' ||
      flow.state === 'attendee-rejected'
    ) {
      const requestId = flow.activeRequest?.id
      if (requestId) {
        navigate(`/prototype/respond/${requestId}${window.location.search}`, {
          replace: true,
        })
      }
    }
  }, [flow.state, flow.activeRequest?.id, navigate])

  return <OrganizerExperience flow={flow} showReviewNav={showReviewNav} />
}

function OrganizerExperience({
  flow,
  showReviewNav,
}: {
  flow: FlowApi
  showReviewNav: boolean
}) {
  const navigate = useNavigate()
  const showSurface = flow.surfaceMode !== null && flow.recommendation !== null
  const goHome = () => navigate('/')

  const onPrimary = () => {
    if (!flow.surfaceMode || !flow.recommendation) return
    if (flow.surfaceMode === 'no-option') {
      flow.changeConditions()
      return
    }
    if (
      flow.surfaceMode === 'ready' ||
      flow.surfaceMode === 'ready-after-confirmation' ||
      (flow.surfaceMode === 'next-alternative' &&
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
      title="회의 시간 잡기"
      layout="desktop"
      contentWidth={showSurface ? 'wide' : 'default'}
      onClose={goHome}
      footer={
        <ReviewNav
          visible={showReviewNav}
          state={flow.state}
          scenarioId={flow.scenarioId}
          requestId={flow.activeRequest?.id}
          recipientName={flow.activeRequest?.targetParticipantName}
          dateLabel={flow.activeRequest?.dateLabel}
          timeLabel={flow.activeRequest?.timeLabel}
          organizerNote={
            flow.state === 'participant-setup'
              ? '이번 플로우에서는 주최자가 직접 참석하는 회의를 가정했어요.'
              : undefined
          }
        />
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

      {showSurface && flow.surfaceMode && flow.recommendation && (
        <DecisionSurface
          mode={flow.surfaceMode}
          recommendation={flow.recommendation}
          isReasonExpanded={flow.reasonExpanded}
          onToggleReason={
            flow.surfaceMode === 'waiting' || flow.surfaceMode === 'no-option'
              ? undefined
              : flow.toggleReasonExpanded
          }
          onPrimaryAction={
            flow.surfaceMode === 'waiting' ? undefined : onPrimary
          }
          animateIn={flow.playCardEnter}
          onAnimateInEnd={flow.acknowledgeCardEnter}
        />
      )}

      {(flow.state === 'request-preview' ||
        flow.session.phase === 'sending-request') &&
        flow.activeRequest && (
          <RequestPreview
            recipientName={flow.activeRequest.targetParticipantName}
            dateDisplay={flow.activeRequest.dateLabel}
            timeLabel={flow.activeRequest.timeLabel}
            loading={flow.isSendingRequest}
            onSend={flow.sendRequest}
            onBack={flow.backFromPreview}
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

export function AttendeeRespondApp() {
  const { requestId = '' } = useParams()
  const navigate = useNavigate()
  const scenarioId = useScenarioId()
  const flow = usePrototypeFlow(scenarioId)
  const showReviewNav = shouldShowPrototypeControls()
  const [step, setStep] = useState<'response' | 'result' | 'review-transition'>(
    'response',
  )

  const storedMatch = findSessionByRequestId(requestId)
  const request =
    flow.activeRequest?.id === requestId
      ? flow.activeRequest
      : storedMatch?.activeRequest
  const missing = !request

  useEffect(() => {
    if (!requestId || !storedMatch) return
    if (
      flow.activeRequest?.id === requestId &&
      (flow.state === 'attendee-request' ||
        flow.state === 'attendee-approved' ||
        flow.state === 'attendee-rejected' ||
        flow.session.phase === 'attendee-submitting')
    ) {
      return
    }
    flow.openAttendeeRequest(requestId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId])

  useEffect(() => {
    if (!request) return
    const responded =
      request.status === 'approved' ||
      request.status === 'declined' ||
      request.status === 'resolved'
    if (responded && step === 'response') {
      setStep('result')
    }
  }, [request, step])

  const goOrganizer = () => {
    const sessionId = loadSession()?.id ?? flow.sessionId
    navigate(
      `/prototype/session/${sessionId}/organizer${window.location.search}`,
    )
  }

  const onProductConfirm = (approved: boolean) => {
    if (approved) {
      flow.finishAttendeeApproved()
    } else {
      flow.finishAttendeeRejected()
    }
    if (showReviewNav) {
      setStep('review-transition')
      return
    }
    // usertest: end attendee product flow only
    navigate('/')
  }

  if (missing) {
    return (
      <ScreenShell
        title="일정 확인"
        layout="mobile"
        onClose={() => navigate('/')}
      >
        <div className="flex flex-1 flex-col justify-center py-16">
          <h2
            className="mb-3 text-[24px] font-bold leading-[34px] text-meeting-text"
            style={{ wordBreak: 'keep-all' }}
          >
            요청을 찾을 수 없어요.
          </h2>
          <p className="mb-8 text-[16px] leading-6 text-meeting-text-secondary">
            링크가 만료되었거나 잘못된 요청일 수 있어요.
          </p>
          <Link
            to="/"
            className="text-[15px] font-medium text-meeting-text-secondary underline"
          >
            처음으로
          </Link>
        </div>
      </ScreenShell>
    )
  }

  const alreadyResponded =
    request.status === 'approved' ||
    request.status === 'declined' ||
    request.status === 'resolved'

  const showApproved =
    request.response === 'approved' || flow.state === 'attendee-approved'
  const showDeclined =
    request.response === 'declined' || flow.state === 'attendee-rejected'
  const approved = showApproved && !showDeclined

  return (
    <ScreenShell
      title="일정 확인"
      layout="mobile"
      onClose={() => navigate('/')}
      footer={
        step === 'review-transition' && showReviewNav ? (
          <AttendeeReviewTransition
            approved={approved}
            onContinue={goOrganizer}
          />
        ) : undefined
      }
    >
      {!alreadyResponded && step === 'response' && (
        <AttendeeRequest
          dateDisplay={request.dateLabel}
          timeLabel={request.timeLabel}
          organizerName={request.organizerName}
          conflictLabel={request.conflictPublicLabel}
          loading={flow.isResponding}
          onApprove={() => flow.approveRequest(requestId)}
          onReject={() => flow.rejectRequest(requestId)}
        />
      )}

      {alreadyResponded && step === 'result' && (
        <AttendeeResult
          approved={approved}
          onConfirm={() => onProductConfirm(approved)}
        />
      )}

      {step === 'review-transition' && showReviewNav ? (
        <div className="flex flex-1 flex-col justify-center py-16">
          <h2
            className="mb-3 text-[24px] font-bold leading-[34px] text-meeting-text"
            style={{ wordBreak: 'keep-all' }}
          >
            {approved ? '가능하다고 전달했어요.' : '어렵다고 전달했어요.'}
          </h2>
          <p
            className="text-[16px] leading-6 text-meeting-text-secondary"
            style={{ wordBreak: 'keep-all' }}
          >
            {approved
              ? '회의가 확정되면 캘린더에 반영돼요.'
              : '다른 시간을 다시 찾을게요.'}
          </p>
        </div>
      ) : null}
    </ScreenShell>
  )
}
