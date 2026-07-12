import { describe, expect, it } from 'vitest'
import { decisionParticipants } from '@/features/meeting-decision/data/participants'
import {
  applyAnalyzedRecommendation,
  beginAttendeeResponse,
  beginSendingRequest,
  canFinalizeRecommendation,
  completeAttendeeResponse,
  completeMeeting,
  createSession,
  goToMeetingDetails,
  markRequestPending,
  openAttendeeView,
  openRequestPreview,
  resolveAfterAttendeeResponse,
  runRecommendation,
  updateMeetingDraft,
  withAttendanceType,
} from './connected-flow.actions'

describe('connected-flow request lifecycle', () => {
  function sessionWithNeedConfirmation() {
    let session = createSession('coordination')
    const recommendation = runRecommendation(session.attendanceTypes, {})
    expect(recommendation.status).toBe('NEED_CONFIRMATION')
    session = applyAnalyzedRecommendation(session, recommendation)
    return session
  }

  it('creates a draft request with exact slot and required target', () => {
    const session = openRequestPreview(sessionWithNeedConfirmation())
    const request = session.activeRequest
    expect(request).toBeDefined()
    expect(request?.status).toBe('draft')
    expect(request?.targetParticipantId).toBe('jihoon')
    expect(request?.slotId).toBe('thu-15')
    expect(request?.conflictPublicLabel).toBe('개인 보호 시간')
    expect(request?.meetingTitle).toBe('')
  })

  it('rejects optional participants as request targets', () => {
    let session = createSession('coordination')
    session = withAttendanceType(session, 'jihoon', 'optional')
    const recommendation = runRecommendation(session.attendanceTypes, {})
    // With jihoon optional, READY is expected for default fixture
    expect(recommendation.status).toBe('READY')
    session = applyAnalyzedRecommendation(session, recommendation)
    expect(() => openRequestPreview(session)).toThrow()
  })

  it('moves draft → sent → pending', () => {
    let session = openRequestPreview(sessionWithNeedConfirmation())
    session = beginSendingRequest(session)
    expect(session.activeRequest?.status).toBe('sent')
    expect(session.phase).toBe('sending-request')
    session = markRequestPending(session)
    expect(session.activeRequest?.status).toBe('pending')
    expect(session.phase).toBe('organizer-waiting')
  })

  it('blocks a second response on the same request', () => {
    let session = openRequestPreview(sessionWithNeedConfirmation())
    session = beginSendingRequest(session)
    session = markRequestPending(session)
    const requestId = session.activeRequest!.id
    session = beginAttendeeResponse(session, requestId)
    session = completeAttendeeResponse(session, requestId, 'approved')
    expect(() => beginAttendeeResponse(session, requestId)).toThrow(
      /이미 응답한/,
    )
    expect(() =>
      completeAttendeeResponse(session, requestId, 'declined'),
    ).toThrow(/이미 응답한/)
  })

  it('approve recomputes to READY without hardcoding', () => {
    let session = openRequestPreview(sessionWithNeedConfirmation())
    session = beginSendingRequest(session)
    session = markRequestPending(session)
    const requestId = session.activeRequest!.id
    session = completeAttendeeResponse(session, requestId, 'approved')
    session = resolveAfterAttendeeResponse(session)
    expect(session.activeRequest?.status).toBe('resolved')
    expect(session.currentRecommendation?.status).toBe('READY')
    expect(session.isReadyAfterConfirmation).toBe(true)
    expect(
      session.currentRecommendation &&
        session.currentRecommendation.status !== 'NO_OPTION'
        ? session.currentRecommendation.evaluation.slot.id
        : null,
    ).toBe('thu-15')
  })

  it('decline recomputes a new alternative without hardcoding', () => {
    let session = openRequestPreview(sessionWithNeedConfirmation())
    session = beginSendingRequest(session)
    session = markRequestPending(session)
    const requestId = session.activeRequest!.id
    const declinedSlot = session.activeRequest!.slotId
    session = completeAttendeeResponse(session, requestId, 'declined')
    session = resolveAfterAttendeeResponse(session)
    expect(session.isNextAlternative).toBe(true)
    expect(session.currentRecommendation?.status).toBe('NEED_CONFIRMATION')
    expect(
      session.currentRecommendation &&
        session.currentRecommendation.status !== 'NO_OPTION'
        ? session.currentRecommendation.evaluation.slot.id
        : null,
    ).not.toBe(declinedSlot)
    expect(
      session.currentRecommendation &&
        session.currentRecommendation.status === 'NEED_CONFIRMATION'
        ? session.currentRecommendation.confirmationTargets[0]?.name
        : null,
    ).toBe('박서연')
  })

  it('openAttendeeView restores completion for already-responded requests', () => {
    let session = openRequestPreview(sessionWithNeedConfirmation())
    session = beginSendingRequest(session)
    session = markRequestPending(session)
    const requestId = session.activeRequest!.id
    session = completeAttendeeResponse(session, requestId, 'declined')
    const reopened = openAttendeeView(session, requestId)
    expect(reopened.phase).toBe('attendee-declined')
    expect(reopened.actor).toBe('attendee')
  })

  it('does not include organizer as a mutable target', () => {
    const organizer = decisionParticipants.find((p) => p.isOrganizer)
    expect(organizer?.id).toBe('minji')
    const session = sessionWithNeedConfirmation()
    const opened = openRequestPreview(session)
    expect(opened.activeRequest?.targetParticipantId).not.toBe('minji')
  })
})

describe('connected-flow meeting finalize', () => {
  it('only finalizes READY recommendations and prevents duplicate create', () => {
    let session = createSession('coordination')
    session = withAttendanceType(session, 'jihoon', 'optional')
    const recommendation = runRecommendation(session.attendanceTypes, {})
    expect(recommendation.status).toBe('READY')
    session = applyAnalyzedRecommendation(session, recommendation)
    expect(canFinalizeRecommendation(session)).toBe(true)

    session = goToMeetingDetails(session)
    expect(session.phase).toBe('meeting-details')

    const blocked = completeMeeting(session)
    expect(blocked.phase).toBe('meeting-details')
    expect(blocked.meetingCreatedAt).toBeUndefined()
    expect(blocked.createdMeeting).toBeUndefined()

    session = updateMeetingDraft(session, {
      title: '킥오프 미팅',
      location: 'https://meet.example.com/kickoff',
    })
    session = completeMeeting(session)
    expect(session.phase).toBe('completed')
    expect(session.meetingCreatedAt).toBeDefined()
    expect(session.createdMeeting).toBeDefined()
    expect(session.createdMeeting?.title).toBe('킥오프 미팅')
    expect(session.createdMeeting?.location).toBe(
      'https://meet.example.com/kickoff',
    )
    expect(session.createdMeeting?.sessionId).toBe(session.id)
    expect(session.createdMeeting?.slotId).toBe('thu-15')
    expect(session.meeting.title).toBe('킥오프 미팅')

    const again = completeMeeting(session)
    expect(again.phase).toBe('completed')
    expect(again.createdMeeting?.id).toBe(session.createdMeeting?.id)
    expect(again.meetingCreatedAt).toBe(session.meetingCreatedAt)
  })

  it('blocks finalize for NEED_CONFIRMATION and WAITING', () => {
    let session = createSession('coordination')
    const recommendation = runRecommendation(session.attendanceTypes, {})
    expect(recommendation.status).toBe('NEED_CONFIRMATION')
    session = applyAnalyzedRecommendation(session, recommendation)
    expect(canFinalizeRecommendation(session)).toBe(false)
    expect(goToMeetingDetails(session).phase).toBe('organizer-result')

    session = openRequestPreview(session)
    session = beginSendingRequest(session)
    session = markRequestPending(session)
    expect(session.phase).toBe('organizer-waiting')
    expect(canFinalizeRecommendation(session)).toBe(false)
  })

  it('allows finalize after approval when domain status is READY', () => {
    let session = createSession('coordination')
    let recommendation = runRecommendation(session.attendanceTypes, {})
    session = applyAnalyzedRecommendation(session, recommendation)
    session = openRequestPreview(session)
    session = beginSendingRequest(session)
    session = markRequestPending(session)
    const requestId = session.activeRequest!.id
    session = completeAttendeeResponse(session, requestId, 'approved')
    session = resolveAfterAttendeeResponse(session)
    expect(session.currentRecommendation?.status).toBe('READY')
    expect(session.isReadyAfterConfirmation).toBe(true)
    expect(canFinalizeRecommendation(session)).toBe(true)
    session = goToMeetingDetails(session)
    expect(session.phase).toBe('meeting-details')
  })
})
