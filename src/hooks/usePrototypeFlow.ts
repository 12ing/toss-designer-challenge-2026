import { useCallback, useEffect, useRef, useState } from 'react'
import { participants as seedParticipants } from '@/data/participants'
import type {
  AttendanceType,
  DecisionState,
  MeetingDraft,
  Participant,
  ScenarioId,
} from '@/types/schedule'

const ANALYZE_MS = 1000
const SEND_REQUEST_MS = 700
const ATTENDEE_RESPONSE_MS = 600

const defaultMeeting: MeetingDraft = {
  title: '대시보드 개선 방향 논의',
  location: '4층 회의실 A',
}

export type ConfirmSource = 'initial' | 'alternative'

type DecisionSurfaceState = Extract<
  DecisionState,
  | 'ready'
  | 'need-confirmation'
  | 'waiting'
  | 'ready-after-confirmation'
  | 'next-alternative'
>

function defaultResumeState(scenarioId: ScenarioId): DecisionSurfaceState {
  if (scenarioId === 'ready') return 'ready'
  if (scenarioId === 'rejected') return 'next-alternative'
  return 'need-confirmation'
}

export function usePrototypeFlow(initialScenario: ScenarioId) {
  const [state, setState] = useState<DecisionState>(() =>
    initialScenario === 'rejected' ? 'next-alternative' : 'participant-setup',
  )
  const [scenarioId, setScenarioId] = useState<ScenarioId>(initialScenario)
  const [confirmSource, setConfirmSource] = useState<ConfirmSource>(() =>
    initialScenario === 'rejected' ? 'alternative' : 'initial',
  )
  const [participants, setParticipants] =
    useState<Participant[]>(seedParticipants)
  const [meeting, setMeeting] = useState<MeetingDraft>(defaultMeeting)
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
  const [reasonExpanded, setReasonExpanded] = useState(false)
  const [playCardEnter, setPlayCardEnter] = useState(false)

  const resumeStateRef = useRef<DecisionSurfaceState | null>(
    defaultResumeState(initialScenario),
  )
  const bootstrappedScenario = useRef(initialScenario)

  // URL 시나리오가 바뀌면 플로우를 다시 시작합니다.
  useEffect(() => {
    if (bootstrappedScenario.current === initialScenario) return
    bootstrappedScenario.current = initialScenario
    setScenarioId(initialScenario)
    setParticipants(seedParticipants)
    setMeeting(defaultMeeting)
    setIsSendingRequest(false)
    setIsResponding(false)
    setReasonExpanded(false)
    setConfirmSource(initialScenario === 'rejected' ? 'alternative' : 'initial')
    resumeStateRef.current = defaultResumeState(initialScenario)
    setPlayCardEnter(false)
    if (initialScenario === 'rejected') {
      setState('next-alternative')
    } else {
      setState('participant-setup')
    }
  }, [initialScenario])

  const selectScenario = useCallback((id: ScenarioId) => {
    setScenarioId(id)
    setParticipants(seedParticipants)
    setMeeting(defaultMeeting)
    setReasonExpanded(false)
    setConfirmSource(id === 'rejected' ? 'alternative' : 'initial')
    resumeStateRef.current = defaultResumeState(id)
    bootstrappedScenario.current = id
    setPlayCardEnter(false)
    if (id === 'rejected') {
      setState('next-alternative')
      return
    }
    setState('participant-setup')
  }, [])

  const setAttendanceType = useCallback(
    (id: string, type: AttendanceType) => {
      setParticipants((prev) =>
        prev.map((person) =>
          person.id === id && !person.isOrganizer
            ? { ...person, attendanceType: type }
            : person,
        ),
      )
    },
    [],
  )

  const startAnalyzing = useCallback(() => {
    setReasonExpanded(false)
    setState('analyzing')
  }, [])

  useEffect(() => {
    if (state !== 'analyzing') return

    const timer = window.setTimeout(() => {
      setPlayCardEnter(true)
      if (scenarioId === 'ready') {
        setState('ready')
        resumeStateRef.current = 'ready'
      } else if (scenarioId === 'rejected') {
        setConfirmSource('alternative')
        setState('next-alternative')
        resumeStateRef.current = 'next-alternative'
      } else {
        setState('need-confirmation')
        resumeStateRef.current = 'need-confirmation'
      }
    }, ANALYZE_MS)

    return () => window.clearTimeout(timer)
  }, [state, scenarioId])

  const acknowledgeCardEnter = useCallback(() => {
    setPlayCardEnter(false)
  }, [])

  const goToMeetingDetails = useCallback(() => {
    setReasonExpanded(false)
    setState('meeting-details')
  }, [])

  const completeMeeting = useCallback(() => {
    setState('completed')
  }, [])

  const finishReview = useCallback(() => {
    setState('review-complete')
  }, [])

  const backToDecision = useCallback(() => {
    if (scenarioId === 'ready') {
      setState('ready')
      return
    }
    setState('ready-after-confirmation')
  }, [scenarioId])

  const openRequestPreview = useCallback(() => {
    setState((current) => {
      if (current === 'next-alternative') {
        setConfirmSource('alternative')
        resumeStateRef.current = 'next-alternative'
      } else if (current === 'need-confirmation') {
        setConfirmSource('initial')
        resumeStateRef.current = 'need-confirmation'
      }
      return 'request-preview'
    })
  }, [])

  const sendRequest = useCallback(() => {
    setIsSendingRequest(true)
    window.setTimeout(() => {
      setIsSendingRequest(false)
      setState('waiting')
      resumeStateRef.current =
        confirmSource === 'alternative' ? 'next-alternative' : 'need-confirmation'
    }, SEND_REQUEST_MS)
  }, [confirmSource])

  const openAttendeeRequest = useCallback(() => {
    setState('attendee-request')
  }, [])

  const approveRequest = useCallback(() => {
    setIsResponding(true)
    window.setTimeout(() => {
      setIsResponding(false)
      setState('attendee-approved')
    }, ATTENDEE_RESPONSE_MS)
  }, [])

  const rejectRequest = useCallback(() => {
    setIsResponding(true)
    window.setTimeout(() => {
      setIsResponding(false)
      setState('attendee-rejected')
    }, ATTENDEE_RESPONSE_MS)
  }, [])

  const finishAttendeeApproved = useCallback(() => {
    setState('ready-after-confirmation')
    resumeStateRef.current = 'ready-after-confirmation'
  }, [])

  const finishAttendeeRejected = useCallback(() => {
    setConfirmSource('alternative')
    setState('next-alternative')
    resumeStateRef.current = 'next-alternative'
  }, [])

  const backFromPreview = useCallback(() => {
    const resume =
      confirmSource === 'alternative' ? 'next-alternative' : 'need-confirmation'
    resumeStateRef.current = resume
    setState(resume)
  }, [confirmSource])

  const toggleReasonExpanded = useCallback(() => {
    setReasonExpanded((prev) => !prev)
  }, [])

  const updateMeeting = useCallback((draft: Partial<MeetingDraft>) => {
    setMeeting((prev) => ({ ...prev, ...draft }))
  }, [])

  return {
    state,
    scenarioId,
    confirmSource,
    participants,
    meeting,
    isSendingRequest,
    isResponding,
    reasonExpanded,
    playCardEnter,
    acknowledgeCardEnter,
    selectScenario,
    setAttendanceType,
    startAnalyzing,
    goToMeetingDetails,
    completeMeeting,
    finishReview,
    backToDecision,
    openRequestPreview,
    sendRequest,
    openAttendeeRequest,
    approveRequest,
    rejectRequest,
    finishAttendeeApproved,
    finishAttendeeRejected,
    backFromPreview,
    toggleReasonExpanded,
    updateMeeting,
  }
}
