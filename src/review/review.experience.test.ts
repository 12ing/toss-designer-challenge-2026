import { describe, expect, it } from 'vitest'
import { recommendMeeting } from '@/features/meeting-decision/engine/decision-engine'
import { candidateSlots } from '@/features/meeting-decision/data/candidate-slots'
import { decisionParticipants } from '@/features/meeting-decision/data/participants'
import { getScenarioPreset } from '@/features/meeting-decision/data/scenario-presets'
import { createSessionFromAttendance } from '@/features/meeting-decision/connected-flow/connected-flow.actions'
import { getLabPreset, labPresets } from '@/lab/rule-lab-presets'
import { reviewNotesByStep } from '@/review/review-notes'
import {
  isDebugMode,
  isReviewMode,
  isUserTestMode,
} from '@/review/review-mode'
import { reviewStepFromPhase } from '@/review/review-steps'

describe('review mode helpers', () => {
  it('separates review, usertest, and debug', () => {
    expect(isReviewMode(new URLSearchParams('review=1'))).toBe(true)
    expect(isUserTestMode(new URLSearchParams('usertest=1'))).toBe(true)
    expect(isReviewMode(new URLSearchParams('usertest=1&review=1'))).toBe(false)
    expect(isDebugMode(new URLSearchParams('debug=1'))).toBe(true)
    expect(isReviewMode(new URLSearchParams(''))).toBe(false)
  })
})

describe('review step notes', () => {
  it('provides short notes for every step', () => {
    const steps = Object.keys(reviewNotesByStep)
    expect(steps).toHaveLength(5)
    for (const note of Object.values(reviewNotesByStep)) {
      expect(note.problem.length).toBeGreaterThan(10)
      expect(note.rule.length).toBeGreaterThan(10)
      expect(note.omitted.length).toBeGreaterThan(10)
    }
  })

  it('maps phases to review steps', () => {
    expect(reviewStepFromPhase('participant-setup')).toBe(
      'attendance-conditions',
    )
    expect(reviewStepFromPhase('organizer-result')).toBe('time-recommendation')
    expect(reviewStepFromPhase('request-preview')).toBe('confirmation-request')
    expect(reviewStepFromPhase('attendee-request')).toBe('attendee-response')
    expect(reviewStepFromPhase('completed')).toBe('meeting-confirmation')
  })
})

describe('landing preview engine', () => {
  it('coordination seed yields NEED_CONFIRMATION for live preview', () => {
    const result = recommendMeeting({
      participants: decisionParticipants,
      candidateSlots,
      attendanceTypes: getScenarioPreset('coordination').attendanceTypes,
      responseOverrides: {},
    })
    expect(result.status).toBe('NEED_CONFIRMATION')
  })
})

describe('rule lab presets', () => {
  it('sets inputs only and recomputes through the engine', () => {
    for (const preset of labPresets) {
      const result = recommendMeeting({
        participants: decisionParticipants,
        candidateSlots,
        attendanceTypes: getLabPreset(preset.id).attendanceTypes,
        responseOverrides: {},
      })
      expect(result).toBeDefined()
      expect(['READY', 'NEED_CONFIRMATION', 'NO_OPTION']).toContain(
        result.status,
      )
    }
  })

  it('ready preset becomes READY and coordination becomes NEED_CONFIRMATION', () => {
    const ready = recommendMeeting({
      participants: decisionParticipants,
      candidateSlots,
      attendanceTypes: getLabPreset('ready').attendanceTypes,
      responseOverrides: {},
    })
    const coordination = recommendMeeting({
      participants: decisionParticipants,
      candidateSlots,
      attendanceTypes: getLabPreset('coordination').attendanceTypes,
      responseOverrides: {},
    })
    expect(ready.status).toBe('READY')
    expect(coordination.status).toBe('NEED_CONFIRMATION')
  })

  it('lab product session keeps attendance and clears request/overrides', () => {
    const attendance = getLabPreset('ready').attendanceTypes
    const session = createSessionFromAttendance(attendance, 'coordination')
    expect(session.attendanceTypes.jihoon).toBe('optional')
    expect(session.activeRequest).toBeUndefined()
    expect(session.responseOverrides).toEqual({})
    expect(session.currentRecommendation).toBeNull()
    expect(session.phase).toBe('participant-setup')
  })
})
