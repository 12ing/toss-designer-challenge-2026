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

function snapshotAttendance(list: Participant[]) {
  return list
    .map((p) => `${p.id}:${p.attendanceType}`)
    .sort()
    .join('|')
}

function defaultResumeState(scenarioId: ScenarioId): DecisionSurfaceState {
  if (scenarioId === 'ready') return 'ready'
  if (scenarioId === 'rejected') return 'next-alternative'
  return 'need-confirmation'
}

export function usePrototypeFlow() {
  const [state, setState] = useState<DecisionState>('scenario-hub')
  const [scenarioId, setScenarioId] = useState<ScenarioId | null>(null)
  const [confirmSource, setConfirmSource] =
    useState<ConfirmSource>('initial')
  const [participants, setParticipants] =
    useState<Participant[]>(seedParticipants)
  const [meeting, setMeeting] = useState<MeetingDraft>(defaultMeeting)
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
  const [reasonExpanded, setReasonExpanded] = useState(false)
  const [isRevisedRecommendation, setIsRevisedRecommendation] = useState(false)
  const [playCardEnter, setPlayCardEnter] = useState(false)

  const resumeStateRef = useRef<DecisionSurfaceState | null>(null)
  const conditionsBaselineRef = useRef<string | null>(null)
  const editingConditionsRef = useRef(false)
  const participantsAtAnalyzeRef = useRef(snapshotAttendance(seedParticipants))

  const resetToHub = useCallback(() => {
    setState('scenario-hub')
    setScenarioId(null)
    setConfirmSource('initial')
    setParticipants(seedParticipants)
    setMeeting(defaultMeeting)
    setIsSendingRequest(false)
    setIsResponding(false)
    setReasonExpanded(false)
    setIsRevisedRecommendation(false)
    setPlayCardEnter(false)
    resumeStateRef.current = null
    conditionsBaselineRef.current = null
    editingConditionsRef.current = false
  }, [])

  const selectScenario = useCallback((id: ScenarioId) => {
    setScenarioId(id)
    setReasonExpanded(false)
    setIsRevisedRecommendation(false)
    setConfirmSource(id === 'rejected' ? 'alternative' : 'initial')
    editingConditionsRef.current = false
    conditionsBaselineRef.current = null
    resumeStateRef.current = defaultResumeState(id)
    if (id === 'rejected') {
      setPlayCardEnter(true)
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
    participantsAtAnalyzeRef.current = snapshotAttendance(participants)
    setReasonExpanded(false)
    setState('analyzing')
  }, [participants])

  useEffect(() => {
    if (state !== 'analyzing' || !scenarioId) return

    const timer = window.setTimeout(() => {
      if (editingConditionsRef.current) {
        const baseline = conditionsBaselineRef.current
        const current = participantsAtAnalyzeRef.current
        const changed = baseline !== null && baseline !== current

        editingConditionsRef.current = false
        conditionsBaselineRef.current = null

        if (changed) {
          setIsRevisedRecommendation(true)
          setConfirmSource('initial')
          setPlayCardEnter(true)
          setState('ready')
          resumeStateRef.current = 'ready'
          return
        }

        const resume = resumeStateRef.current ?? defaultResumeState(scenarioId)
        setIsRevisedRecommendation(false)
        setPlayCardEnter(false)
        if (resume === 'next-alternative') {
          setConfirmSource('alternative')
        }
        setState(resume)
        return
      }

      setIsRevisedRecommendation(false)
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

  const backToDecision = useCallback(() => {
    if (isRevisedRecommendation || scenarioId === 'ready') {
      setState('ready')
      return
    }
    setState('ready-after-confirmation')
  }, [isRevisedRecommendation, scenarioId])

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

  const cancelRequest = useCallback(() => {
    const resume =
      confirmSource === 'alternative' ? 'next-alternative' : 'need-confirmation'
    resumeStateRef.current = resume
    setState(resume)
  }, [confirmSource])

  const changeConditions = useCallback(() => {
    const current = state
    if (
      current === 'ready' ||
      current === 'need-confirmation' ||
      current === 'waiting' ||
      current === 'ready-after-confirmation' ||
      current === 'next-alternative'
    ) {
      resumeStateRef.current = current === 'waiting'
        ? confirmSource === 'alternative'
          ? 'next-alternative'
          : 'need-confirmation'
        : current
    } else if (scenarioId) {
      resumeStateRef.current = defaultResumeState(scenarioId)
    }

    conditionsBaselineRef.current = snapshotAttendance(participants)
    editingConditionsRef.current = true
    setReasonExpanded(false)
    setState('participant-setup')
  }, [state, confirmSource, scenarioId, participants])

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
    isRevisedRecommendation,
    playCardEnter,
    acknowledgeCardEnter,
    resetToHub,
    selectScenario,
    setAttendanceType,
    startAnalyzing,
    goToMeetingDetails,
    completeMeeting,
    backToDecision,
    openRequestPreview,
    sendRequest,
    openAttendeeRequest,
    approveRequest,
    rejectRequest,
    finishAttendeeApproved,
    finishAttendeeRejected,
    cancelRequest,
    changeConditions,
    toggleReasonExpanded,
    updateMeeting,
  }
}
