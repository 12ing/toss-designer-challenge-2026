import { useCallback, useEffect, useState } from 'react'
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

  const resetToHub = useCallback(() => {
    setState('scenario-hub')
    setScenarioId(null)
    setConfirmSource('initial')
    setParticipants(seedParticipants)
    setMeeting(defaultMeeting)
    setIsSendingRequest(false)
    setIsResponding(false)
    setReasonExpanded(false)
  }, [])

  const selectScenario = useCallback((id: ScenarioId) => {
    setScenarioId(id)
    setReasonExpanded(false)
    setConfirmSource(id === 'rejected' ? 'alternative' : 'initial')
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
    setState('analyzing')
  }, [])

  useEffect(() => {
    if (state !== 'analyzing' || !scenarioId) return

    const timer = window.setTimeout(() => {
      if (scenarioId === 'ready') {
        setState('ready')
      } else {
        setState('need-confirmation')
      }
    }, ANALYZE_MS)

    return () => window.clearTimeout(timer)
  }, [state, scenarioId])

  const goToMeetingDetails = useCallback(() => {
    setReasonExpanded(false)
    setState('meeting-details')
  }, [])

  const completeMeeting = useCallback(() => {
    setState('completed')
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
      } else if (current === 'need-confirmation') {
        setConfirmSource('initial')
      }
      return 'request-preview'
    })
  }, [])

  const sendRequest = useCallback(() => {
    setIsSendingRequest(true)
    window.setTimeout(() => {
      setIsSendingRequest(false)
      setState('waiting')
    }, SEND_REQUEST_MS)
  }, [])

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
  }, [])

  const finishAttendeeRejected = useCallback(() => {
    setConfirmSource('alternative')
    setState('next-alternative')
  }, [])

  const cancelRequest = useCallback(() => {
    setState(
      confirmSource === 'alternative' ? 'next-alternative' : 'need-confirmation',
    )
  }, [confirmSource])

  const changeConditions = useCallback(() => {
    setState('participant-setup')
    setReasonExpanded(false)
  }, [])

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
