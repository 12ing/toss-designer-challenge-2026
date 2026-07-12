import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DecisionSurface } from '@/components/decision-surface/DecisionSurface'
import { FlowRecovery } from '@/components/flow/FlowRecovery'
import { ScreenShell } from '@/components/ui/ScreenShell'
import { shouldShowPrototypeControls } from '@/config/prototype'
import { parseScenarioParam } from '@/config/scenarios'
import {
  findSessionByRequestId,
  loadSession,
} from '@/features/meeting-decision/connected-flow/connected-flow.persistence'
import { useFocusPageHeading } from '@/hooks/useFocusPageHeading'
import { usePrototypeFlow } from '@/hooks/usePrototypeFlow'
import { ActorTransitionCard } from '@/review/components/ActorTransitionCard'
import { ReviewChrome } from '@/review/components/ReviewChrome'
import { isDebugMode } from '@/review/review-mode'
import {
  attendeePath,
  completionPath,
  organizerPath,
} from '@/review/review-session.factory'
import { reviewStepFromPhase } from '@/review/review-steps'
import { Analyzing } from '@/screens/Analyzing'
import { AttendeeRequest } from '@/screens/AttendeeRequest'
import { AttendeeResult } from '@/screens/AttendeeResult'
import { MeetingDetails } from '@/screens/MeetingDetails'
import { ParticipantSetup } from '@/screens/ParticipantSetup'
import { ProductCompletion } from '@/screens/ProductCompletion'
import { RequestPreview } from '@/screens/RequestPreview'

function useScenarioId() {
  const [searchParams] = useSearchParams()
  return useMemo(
    () => parseScenarioParam(searchParams.get('scenario')),
    [searchParams],
  )
}

type FlowApi = ReturnType<typeof usePrototypeFlow>

function ReviewFrame({
  showReviewNav,
  step,
  debugLine,
  children,
  transition,
}: {
  showReviewNav: boolean
  step: ReturnType<typeof reviewStepFromPhase>
  debugLine?: string
  children: ReactNode
  transition?: React.ReactNode
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-meeting-bg">
      {showReviewNav ? <ReviewChrome step={step} debugLine={debugLine} /> : null}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {showReviewNav ? transition : null}
    </div>
  )
}

export function PrototypeApp() {
  const navigate = useNavigate()
  const scenarioId = useScenarioId()
  const flow = usePrototypeFlow(scenarioId)

  useEffect(() => {
    if (!flow.sessionId) return
    navigate(organizerPath(flow.sessionId, shouldShowPrototypeControls()), {
      replace: true,
    })
  }, [flow.sessionId, navigate])

  return null
}

export function OrganizerSessionApp() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const scenarioId = useScenarioId()
  const showReviewNav = shouldShowPrototypeControls()
  const flow = usePrototypeFlow(scenarioId, sessionId)

  useEffect(() => {
    const stored = loadSession()
    if (sessionId && stored && stored.id !== sessionId) {
      navigate(organizerPath(stored.id, showReviewNav), { replace: true })
    }
  }, [sessionId, navigate, showReviewNav])

  useEffect(() => {
    if (
      flow.state === 'attendee-request' ||
      flow.state === 'attendee-approved' ||
      flow.state === 'attendee-rejected'
    ) {
      const requestId = flow.activeRequest?.id
      if (requestId) {
        navigate(
          attendeePath(flow.sessionId, requestId, showReviewNav),
          { replace: true },
        )
      }
    }
  }, [
    flow.state,
    flow.activeRequest?.id,
    flow.sessionId,
    navigate,
    showReviewNav,
  ])

  useEffect(() => {
    if (flow.state === 'review-complete' && flow.sessionId) {
      navigate(completionPath(flow.sessionId), { replace: true })
    }
  }, [flow.state, flow.sessionId, navigate])

  if (flow.sessionNotFound) {
    return (
      <ReviewFrame showReviewNav={showReviewNav} step="time-recommendation">
        <ScreenShell hideHeader embedded={showReviewNav} layout="desktop">
          <FlowRecovery
            title="세션을 찾을 수 없어요."
            description="링크가 만료되었거나 잘못된 주소일 수 있어요."
            actionLabel="처음으로"
            href="/"
          />
        </ScreenShell>
      </ReviewFrame>
    )
  }

  return (
    <OrganizerExperience
      key={sessionId ?? flow.sessionId}
      flow={flow}
      showReviewNav={showReviewNav}
    />
  )
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
  const step = reviewStepFromPhase(flow.session.phase)
  useFocusPageHeading(`${flow.state}-${flow.session.phase}`)
  const waitingPadding =
    flow.state === 'waiting' && showReviewNav
      ? 'max-[719px]:pb-[200px]'
      : ''

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

  const debugLine = isDebugMode()
    ? `session ${flow.sessionId} · phase ${flow.session.phase}${
        flow.activeRequest ? ` · request ${flow.activeRequest.id}` : ''
      }`
    : undefined

  const transition =
    flow.state === 'waiting' && flow.activeRequest ? (
      <ActorTransitionCard
        variant="to-attendee"
        recipientName={flow.activeRequest.targetParticipantName}
        dateLabel={flow.activeRequest.dateLabel}
        timeLabel={flow.activeRequest.timeLabel}
        href={attendeePath(
          flow.sessionId,
          flow.activeRequest.id,
          showReviewNav,
        )}
      />
    ) : null

  return (
    <ReviewFrame
      showReviewNav={showReviewNav}
      step={step}
      debugLine={debugLine}
      transition={transition}
    >
      <ScreenShell
        hideHeader
        embedded={showReviewNav}
        layout="desktop"
        contentWidth={showSurface ? 'wide' : 'default'}
      >
        <div className={waitingPadding}>
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
                flow.surfaceMode === 'waiting' ||
                flow.surfaceMode === 'no-option'
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

          {flow.state === 'meeting-details' &&
            (flow.createdMeeting || flow.meetingCreatedAt ? (
              <FlowRecovery
                title="이미 만든 회의가 있어요."
                description="앞서 만든 회의 정보를 다시 확인할 수 있어요."
                actionLabel="회의 보기"
                onAction={() => flow.completeMeeting()}
              />
            ) : !flow.canFinalize || !flow.uiView ? (
              <FlowRecovery
                title="추천한 시간이 더 이상 유효하지 않아요."
                description="현재 참석 조건으로 시간을 다시 찾아주세요."
                actionLabel="시간 다시 찾기"
                onAction={flow.changeConditions}
              />
            ) : (
              <MeetingDetails
                dateDisplay={flow.uiView.dateLabel}
                timeLabel={flow.uiView.timeLabel}
                meeting={flow.meeting}
                creating={flow.isCreatingMeeting}
                onChange={flow.updateMeeting}
                onSubmit={flow.completeMeeting}
                onBack={flow.backToDecision}
              />
            ))}

          {flow.state === 'completed' &&
            (flow.createdMeeting || flow.uiView) && (
              <ProductCompletion
                title={
                  flow.createdMeeting?.title ?? flow.meeting.title
                }
                dateDisplay={
                  flow.createdMeeting?.dateLabel ??
                  flow.uiView?.dateLabel ??
                  ''
                }
                timeLabel={
                  flow.createdMeeting?.timeLabel ??
                  flow.uiView?.timeLabel ??
                  ''
                }
                participants={flow.createdMeeting?.participants ?? []}
                location={flow.createdMeeting?.location}
                onComplete={() => {
                  if (showReviewNav) {
                    flow.finishReview()
                    return
                  }
                  navigate('/')
                }}
              />
            )}

          {flow.state === 'completed' &&
            !flow.createdMeeting &&
            !flow.uiView && (
              <FlowRecovery
                title="회의 결과를 불러올 수 없어요."
                description="처음부터 다시 시작해 주세요."
                actionLabel="처음으로"
                href="/"
              />
            )}
        </div>
      </ScreenShell>
    </ReviewFrame>
  )
}

export function AttendeeRespondApp() {
  const { requestId = '', sessionId: routeSessionId } = useParams()
  const navigate = useNavigate()
  const scenarioId = useScenarioId()
  const flow = usePrototypeFlow(scenarioId, routeSessionId)
  const showReviewNav = shouldShowPrototypeControls()
  const [step, setStep] = useState<'response' | 'result'>('response')
  useFocusPageHeading(`${requestId}-${step}`)

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

  const sessionId =
    routeSessionId ?? loadSession()?.id ?? flow.sessionId ?? storedMatch?.id

  const onReviewContinue = (approved: boolean) => {
    if (approved) {
      flow.finishAttendeeApproved()
    } else {
      flow.finishAttendeeRejected()
    }
    if (sessionId) {
      navigate(organizerPath(sessionId, showReviewNav), { replace: true })
    }
  }

  const reviewStep = reviewStepFromPhase(
    flow.session.phase === 'organizer-waiting'
      ? 'attendee-request'
      : flow.session.phase,
  )

  if (flow.sessionNotFound && !storedMatch) {
    return (
      <ReviewFrame showReviewNav={showReviewNav} step="attendee-response">
        <ScreenShell hideHeader embedded={showReviewNav} layout="mobile">
          <FlowRecovery
            title="세션을 찾을 수 없어요."
            description="링크가 만료되었거나 잘못된 주소일 수 있어요."
            actionLabel="처음으로"
            href="/"
          />
        </ScreenShell>
      </ReviewFrame>
    )
  }

  if (missing) {
    return (
      <ReviewFrame showReviewNav={showReviewNav} step="attendee-response">
        <ScreenShell hideHeader embedded={showReviewNav} layout="mobile">
          <FlowRecovery
            title="요청을 찾을 수 없어요."
            description="링크가 만료되었거나 잘못된 요청일 수 있어요."
            actionLabel="처음으로"
            href="/"
          />
        </ScreenShell>
      </ReviewFrame>
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
    <ReviewFrame showReviewNav={showReviewNav} step={reviewStep}>
      <ScreenShell hideHeader embedded={showReviewNav} layout="mobile">
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
            showReviewCta={showReviewNav}
            onContinue={() => onReviewContinue(approved)}
          />
        )}
      </ScreenShell>
    </ReviewFrame>
  )
}
