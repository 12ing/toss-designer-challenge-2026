import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { candidateSlots } from '@/features/meeting-decision/data/candidate-slots'
import { decisionParticipants } from '@/features/meeting-decision/data/participants'
import { getScenarioPreset } from '@/features/meeting-decision/data/scenario-presets'
import { recommendMeeting } from '@/features/meeting-decision/engine/decision-engine'
import type {
  AttendanceType,
  MeetingRecommendation,
  ResponseOverrides,
  ScenarioPresetId,
  TimeSlotId,
} from '@/features/meeting-decision/engine/decision-engine.types'
import {
  recommendationToUi,
  surfaceFromRecommendation,
} from '@/features/meeting-decision/mappers/to-ui'
import type {
  DecisionState,
  MeetingDraft,
  Participant,
} from '@/types/schedule'

const ANALYZE_MS = 1000
const SEND_REQUEST_MS = 700
const ATTENDEE_RESPONSE_MS = 600

const defaultMeeting: MeetingDraft = {
  title: '대시보드 개선 방향 논의',
  location: '4층 회의실 A',
}

function toUiParticipants(
  attendanceTypes: Record<string, AttendanceType>,
): Participant[] {
  return decisionParticipants.map((person) => ({
    id: person.id,
    name: person.name,
    role: person.role,
    isOrganizer: person.isOrganizer,
    attendanceType: attendanceTypes[person.id] ?? person.defaultAttendanceType,
  }))
}

function runRecommendation(
  attendanceTypes: Record<string, AttendanceType>,
  responseOverrides: ResponseOverrides,
): MeetingRecommendation {
  return recommendMeeting({
    participants: decisionParticipants,
    candidateSlots,
    attendanceTypes,
    responseOverrides,
  })
}

function withOverride(
  prev: ResponseOverrides,
  participantId: string,
  slotId: TimeSlotId,
  value: 'approved' | 'declined',
): ResponseOverrides {
  return {
    ...prev,
    [participantId]: {
      ...prev[participantId],
      [slotId]: value,
    },
  }
}

export function usePrototypeFlow(initialScenario: ScenarioPresetId) {
  const preset = getScenarioPreset(initialScenario)

  const [state, setState] = useState<DecisionState>(() =>
    initialScenario === 'rejected' ? 'analyzing' : 'participant-setup',
  )
  const [scenarioId, setScenarioId] =
    useState<ScenarioPresetId>(initialScenario)
  const [attendanceTypes, setAttendanceTypes] = useState(
    () => preset.attendanceTypes,
  )
  const [responseOverrides, setResponseOverrides] = useState<ResponseOverrides>(
    () => preset.responseOverrides,
  )
  const [recommendation, setRecommendation] =
    useState<MeetingRecommendation | null>(null)
  const [isNextAlternative, setIsNextAlternative] = useState(
    () => initialScenario === 'rejected',
  )
  const [meeting, setMeeting] = useState<MeetingDraft>(defaultMeeting)
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
  const [reasonExpanded, setReasonExpanded] = useState(false)
  const [playCardEnter, setPlayCardEnter] = useState(false)

  const bootstrappedScenario = useRef(initialScenario)
  const pendingAlternativeRef = useRef(initialScenario === 'rejected')
  const overridesRef = useRef(responseOverrides)
  overridesRef.current = responseOverrides

  const applyRecommendation = useCallback(
    (
      next: MeetingRecommendation,
      options: { isNextAlternative?: boolean; animate?: boolean } = {},
    ) => {
      setRecommendation(next)
      setIsNextAlternative(Boolean(options.isNextAlternative))
      setPlayCardEnter(Boolean(options.animate))
      const surface = surfaceFromRecommendation(next, {
        isNextAlternative: options.isNextAlternative,
      })
      if (surface === 'no-option') {
        setState('no-option')
        return
      }
      if (surface === 'ready') {
        setState('ready')
        return
      }
      if (surface === 'next-alternative') {
        setState('next-alternative')
        return
      }
      setState('need-confirmation')
    },
    [],
  )

  const bootstrap = useCallback((id: ScenarioPresetId) => {
    const nextPreset = getScenarioPreset(id)
    setScenarioId(id)
    setAttendanceTypes(nextPreset.attendanceTypes)
    setResponseOverrides(nextPreset.responseOverrides)
    setRecommendation(null)
    setMeeting(defaultMeeting)
    setIsSendingRequest(false)
    setIsResponding(false)
    setReasonExpanded(false)
    pendingAlternativeRef.current = id === 'rejected'
    setIsNextAlternative(id === 'rejected')
    bootstrappedScenario.current = id
    setPlayCardEnter(false)
    setState(id === 'rejected' ? 'analyzing' : 'participant-setup')
  }, [])

  useEffect(() => {
    if (bootstrappedScenario.current === initialScenario) return
    bootstrap(initialScenario)
  }, [initialScenario, bootstrap])

  const participants = useMemo(
    () => toUiParticipants(attendanceTypes),
    [attendanceTypes],
  )

  const uiView = useMemo(
    () => (recommendation ? recommendationToUi(recommendation) : null),
    [recommendation],
  )

  const confirmationTarget = uiView?.confirmation

  const startAnalyzing = useCallback(() => {
    setResponseOverrides({})
    pendingAlternativeRef.current = false
    setIsNextAlternative(false)
    setReasonExpanded(false)
    setRecommendation(null)
    setState('analyzing')
  }, [])

  useEffect(() => {
    if (state !== 'analyzing') return

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      if (params.get('fixture') === 'no-option') {
        const blocked = decisionParticipants.map((p) => {
          if (p.id !== 'minji') return p
          const schedule = { ...p.schedule }
          for (const slot of candidateSlots) {
            schedule[slot.id] = { type: 'hard-busy' as const, publicLabel: '일정 있음' }
          }
          return { ...p, schedule }
        })
        const result = recommendMeeting({
          participants: blocked,
          candidateSlots,
          attendanceTypes,
          responseOverrides: {},
        })
        applyRecommendation(result, {
          isNextAlternative: false,
          animate: true,
        })
        return
      }

      const result = runRecommendation(attendanceTypes, responseOverrides)
      applyRecommendation(result, {
        isNextAlternative: pendingAlternativeRef.current,
        animate: true,
      })
    }, ANALYZE_MS)

    return () => window.clearTimeout(timer)
  }, [state, attendanceTypes, responseOverrides, applyRecommendation])

  const acknowledgeCardEnter = useCallback(() => {
    setPlayCardEnter(false)
  }, [])

  const setAttendanceType = useCallback(
    (id: string, type: AttendanceType) => {
      const person = decisionParticipants.find((p) => p.id === id)
      if (!person || person.isOrganizer) return
      setAttendanceTypes((prev) => ({ ...prev, [id]: type }))
    },
    [],
  )

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
    if (!recommendation) {
      setState('participant-setup')
      return
    }
    if (recommendation.status === 'READY') {
      const hasApproval = Object.values(responseOverrides).some((slots) =>
        Object.values(slots ?? {}).includes('approved'),
      )
      setState(hasApproval ? 'ready-after-confirmation' : 'ready')
      return
    }
    setState(isNextAlternative ? 'next-alternative' : 'need-confirmation')
  }, [recommendation, isNextAlternative, responseOverrides])

  const openRequestPreview = useCallback(() => {
    setState('request-preview')
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

  const currentConfirmTarget = useMemo(() => {
    if (!recommendation || recommendation.status !== 'NEED_CONFIRMATION') {
      return null
    }
    return {
      participantId: recommendation.confirmationTargets[0]?.participantId,
      slotId: recommendation.evaluation.slot.id,
    }
  }, [recommendation])

  const approveRequest = useCallback(() => {
    if (!currentConfirmTarget?.participantId) return
    const { participantId, slotId } = currentConfirmTarget
    setIsResponding(true)
    window.setTimeout(() => {
      setResponseOverrides((prev) =>
        withOverride(prev, participantId, slotId, 'approved'),
      )
      setIsResponding(false)
      setState('attendee-approved')
    }, ATTENDEE_RESPONSE_MS)
  }, [currentConfirmTarget])

  const rejectRequest = useCallback(() => {
    if (!currentConfirmTarget?.participantId) return
    const { participantId, slotId } = currentConfirmTarget
    setIsResponding(true)
    window.setTimeout(() => {
      setResponseOverrides((prev) =>
        withOverride(prev, participantId, slotId, 'declined'),
      )
      setIsResponding(false)
      setState('attendee-rejected')
    }, ATTENDEE_RESPONSE_MS)
  }, [currentConfirmTarget])

  const finishAttendeeApproved = useCallback(() => {
    const result = runRecommendation(attendanceTypes, overridesRef.current)
    setRecommendation(result)
    setIsNextAlternative(false)
    pendingAlternativeRef.current = false
    setPlayCardEnter(false)
    if (result.status === 'READY') {
      setState('ready-after-confirmation')
      return
    }
    applyRecommendation(result, { animate: false })
  }, [attendanceTypes, applyRecommendation])

  const finishAttendeeRejected = useCallback(() => {
    const result = runRecommendation(attendanceTypes, overridesRef.current)
    pendingAlternativeRef.current = true
    applyRecommendation(result, { isNextAlternative: true, animate: false })
  }, [attendanceTypes, applyRecommendation])

  const changeConditions = useCallback(() => {
    setRecommendation(null)
    setReasonExpanded(false)
    setIsNextAlternative(false)
    pendingAlternativeRef.current = false
    setPlayCardEnter(false)
    setState('participant-setup')
  }, [])

  const backFromPreview = useCallback(() => {
    setState(isNextAlternative ? 'next-alternative' : 'need-confirmation')
  }, [isNextAlternative])

  const toggleReasonExpanded = useCallback(() => {
    setReasonExpanded((prev) => !prev)
  }, [])

  const updateMeeting = useCallback((draft: Partial<MeetingDraft>) => {
    setMeeting((prev) => ({ ...prev, ...draft }))
  }, [])

  const selectScenario = useCallback(
    (id: ScenarioPresetId) => {
      bootstrap(id)
    },
    [bootstrap],
  )

  return {
    state,
    scenarioId,
    participants,
    attendanceTypes,
    meeting,
    isSendingRequest,
    isResponding,
    reasonExpanded,
    playCardEnter,
    recommendation,
    uiView,
    confirmationTarget,
    isNextAlternative,
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
    changeConditions,
  }
}
