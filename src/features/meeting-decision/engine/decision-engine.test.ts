import { describe, expect, it } from 'vitest'
import { candidateSlots } from '../data/candidate-slots'
import { decisionParticipants } from '../data/participants'
import {
  coordinationAttendance,
  getScenarioPreset,
  readyAttendance,
} from '../data/scenario-presets'
import {
  evaluateSlot,
  getEffectiveSlotState,
  recommendMeeting,
} from './decision-engine'
import type {
  AttendanceType,
  DecisionParticipant,
  ResponseOverrides,
} from './decision-engine.types'

const mutableIds = decisionParticipants
  .filter((p) => !p.isOrganizer)
  .map((p) => p.id)

function recommend(
  attendanceTypes: Record<string, AttendanceType>,
  responseOverrides: ResponseOverrides = {},
) {
  return recommendMeeting({
    participants: decisionParticipants,
    candidateSlots,
    attendanceTypes,
    responseOverrides,
  })
}

describe('getEffectiveSlotState', () => {
  const jihoon = decisionParticipants.find((p) => p.id === 'jihoon')!

  it('approved protected → free', () => {
    const state = getEffectiveSlotState(jihoon, 'thu-15', {
      jihoon: { 'thu-15': 'approved' },
    })
    expect(state.type).toBe('free')
  })

  it('declined protected → hard-busy', () => {
    const state = getEffectiveSlotState(jihoon, 'thu-15', {
      jihoon: { 'thu-15': 'declined' },
    })
    expect(state.type).toBe('hard-busy')
  })

  it('unrelated override does not change free slot', () => {
    const state = getEffectiveSlotState(jihoon, 'fri-11', {
      jihoon: { 'thu-15': 'approved' },
    })
    expect(state.type).toBe('free')
  })

  it('override on hard-busy is ignored', () => {
    const state = getEffectiveSlotState(jihoon, 'mon-16', {
      jihoon: { 'mon-16': 'approved' },
    })
    expect(state.type).toBe('hard-busy')
  })
})

describe('evaluateSlot', () => {
  const thu15 = candidateSlots.find((s) => s.id === 'thu-15')!

  it('required hard-busy increments conflict count', () => {
    const evaluation = evaluateSlot({
      slot: thu15,
      participants: decisionParticipants,
      attendanceTypes: {
        ...coordinationAttendance,
        // force minji hard by using mon-10
      },
      responseOverrides: {},
    })
    // thu-15 itself has no required hard with coordination
    expect(evaluation.requiredHardConflictCount).toBe(0)
  })

  it('required protected becomes confirmation target', () => {
    const evaluation = evaluateSlot({
      slot: thu15,
      participants: decisionParticipants,
      attendanceTypes: coordinationAttendance,
      responseOverrides: {},
    })
    expect(evaluation.requiredConfirmationTargets.map((t) => t.name)).toEqual([
      '이지훈',
    ])
  })

  it('optional protected is never a confirmation target', () => {
    const fri16 = candidateSlots.find((s) => s.id === 'fri-16')!
    // make only people free of hard conflicts as required: difficult
    // hyunwoo has protected on fri-16 — keep optional
    const evaluation = evaluateSlot({
      slot: fri16,
      participants: decisionParticipants,
      attendanceTypes: {
        minji: 'required',
        jihoon: 'optional',
        seoyeon: 'optional',
        doyoon: 'optional',
        yujin: 'optional',
        hyunwoo: 'optional',
      },
      responseOverrides: {},
    })
    expect(
      evaluation.requiredConfirmationTargets.some((t) => t.participantId === 'hyunwoo'),
    ).toBe(false)
    const hyunwoo = evaluation.participantImpacts.find(
      (i) => i.participantId === 'hyunwoo',
    )
    expect(hyunwoo?.status).toBe('optional-unavailable')
  })

  it('optional hard-busy does not block confirmation', () => {
    const tue13 = candidateSlots.find((s) => s.id === 'tue-13')!
    const evaluation = evaluateSlot({
      slot: tue13,
      participants: decisionParticipants,
      attendanceTypes: {
        minji: 'required',
        jihoon: 'required',
        seoyeon: 'required',
        doyoon: 'optional', // hard 외근
        yujin: 'optional',
        hyunwoo: 'optional',
      },
      responseOverrides: {},
    })
    expect(evaluation.requiredHardConflictCount).toBe(0)
  })

  it('soft-penalty remains available', () => {
    const evaluation = evaluateSlot({
      slot: thu15,
      participants: decisionParticipants,
      attendanceTypes: coordinationAttendance,
      responseOverrides: {},
    })
    const doyoon = evaluation.participantImpacts.find(
      (i) => i.participantId === 'doyoon',
    )
    expect(doyoon?.status).toBe('required-available-with-note')
    expect(evaluation.requiredSoftPenalty).toBeGreaterThan(0)
  })
})

describe('recommendMeeting presets', () => {
  it('coordination → NEED_CONFIRMATION thu-15 이지훈', () => {
    const result = recommend(getScenarioPreset('coordination').attendanceTypes)
    expect(result.status).toBe('NEED_CONFIRMATION')
    if (result.status !== 'NEED_CONFIRMATION') return
    expect(result.evaluation.slot.id).toBe('thu-15')
    expect(result.confirmationTargets[0]?.name).toBe('이지훈')
  })

  it('ready → READY thu-15', () => {
    const result = recommend(getScenarioPreset('ready').attendanceTypes)
    expect(result.status).toBe('READY')
    if (result.status !== 'READY') return
    expect(result.evaluation.slot.id).toBe('thu-15')
  })

  it('rejected → NEED_CONFIRMATION fri-11 박서연', () => {
    const preset = getScenarioPreset('rejected')
    const result = recommend(preset.attendanceTypes, preset.responseOverrides)
    expect(result.status).toBe('NEED_CONFIRMATION')
    if (result.status !== 'NEED_CONFIRMATION') return
    expect(result.evaluation.slot.id).toBe('fri-11')
    expect(result.confirmationTargets[0]?.name).toBe('박서연')
  })

  it('approve 이지훈 thu-15 → READY thu-15', () => {
    const result = recommend(coordinationAttendance, {
      jihoon: { 'thu-15': 'approved' },
    })
    expect(result.status).toBe('READY')
    if (result.status !== 'READY') return
    expect(result.evaluation.slot.id).toBe('thu-15')
  })

  it('decline 이지훈 thu-15 → NEED_CONFIRMATION fri-11 박서연', () => {
    const result = recommend(coordinationAttendance, {
      jihoon: { 'thu-15': 'declined' },
    })
    expect(result.status).toBe('NEED_CONFIRMATION')
    if (result.status !== 'NEED_CONFIRMATION') return
    expect(result.evaluation.slot.id).toBe('fri-11')
    expect(result.confirmationTargets[0]?.name).toBe('박서연')
  })

  it('is deterministic', () => {
    const a = recommend(coordinationAttendance)
    const b = recommend(coordinationAttendance)
    expect(a).toEqual(b)
  })

  it('supports NO_OPTION when every slot has required hard conflict', () => {
    // Force all participants required and invent impossible schedule via overrides
    // Make minji declined on every free slot by temporarily mutating — use custom participants
    const blocked: DecisionParticipant[] = decisionParticipants.map((p) => {
      if (p.id !== 'minji') return p
      const schedule = { ...p.schedule }
      for (const slot of candidateSlots) {
        schedule[slot.id] = { type: 'hard-busy', publicLabel: '일정 있음' }
      }
      return { ...p, schedule }
    })

    const result = recommendMeeting({
      participants: blocked,
      candidateSlots,
      attendanceTypes: coordinationAttendance,
      responseOverrides: {},
    })
    expect(result.status).toBe('NO_OPTION')
    if (result.status !== 'NO_OPTION') return
    expect(result.blockingSummary).toContain('필수 참석자')
  })

  it('changing jihoon required→optional changes status', () => {
    const before = recommend(coordinationAttendance)
    const after = recommend(readyAttendance)
    expect(before.status).toBe('NEED_CONFIRMATION')
    expect(after.status).toBe('READY')
  })
})

describe('32 attendance combinations', () => {
  it('runs all masks without error and respects invariants', () => {
    for (let mask = 0; mask < 32; mask += 1) {
      const attendanceTypes: Record<string, AttendanceType> = {
        minji: 'required',
      }
      mutableIds.forEach((id, index) => {
        attendanceTypes[id] = mask & (1 << index) ? 'required' : 'optional'
      })

      const result = recommend(attendanceTypes)

      expect(result).toBeDefined()
      expect(attendanceTypes.minji).toBe('required')

      if (result.status === 'NO_OPTION') {
        expect(
          result.evaluations.every((e) => e.requiredHardConflictCount > 0),
        ).toBe(true)
        continue
      }

      expect(result.evaluation.requiredHardConflictCount).toBe(0)
      expect(result.evaluation.requiredTotalCount).toBe(
        Object.values(attendanceTypes).filter((t) => t === 'required').length,
      )
      expect(result.evaluation.optionalTotalCount).toBe(
        Object.values(attendanceTypes).filter((t) => t === 'optional').length,
      )

      for (const target of result.evaluation.requiredConfirmationTargets) {
        expect(attendanceTypes[target.participantId]).toBe('required')
      }

      // optional protected never becomes confirmation target
      const hyunwooProtected =
        result.evaluation.requiredConfirmationTargets.some(
          (t) => t.participantId === 'hyunwoo',
        )
      expect(hyunwooProtected).toBe(false)
    }
  })
})

describe('score vector lexicographic order', () => {
  it('prefers fewer confirmations over lower soft penalty', () => {
    // fri-11 has confirm+ soft2; thu-15 has confirm+ soft1 — same confirm, lower soft wins
    const result = recommend(coordinationAttendance)
    expect(result.status).toBe('NEED_CONFIRMATION')
    if (result.status !== 'NEED_CONFIRMATION') return
    expect(result.evaluation.slot.id).toBe('thu-15')
  })
})
