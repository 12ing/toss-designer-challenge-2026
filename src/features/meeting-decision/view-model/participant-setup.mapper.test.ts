import { describe, expect, it } from 'vitest'
import {
  assertPublicLabelSafe,
  mapPrivateScheduleToPublicContext,
} from '../privacy/public-scheduling-context.mapper'
import {
  formatAttendanceSummary,
  mapParticipantsToSetupViewModel,
} from './participant-setup.mapper'
import { coordinationAttendance } from '../data/scenario-presets'

describe('formatAttendanceSummary', () => {
  it('formats normal counts', () => {
    expect(formatAttendanceSummary(4, 2)).toBe('필수 4명 · 선택 2명')
  })

  it('uses 선택 없음 when optional is zero', () => {
    expect(formatAttendanceSummary(6, 0)).toBe('필수 6명 · 선택 없음')
    expect(formatAttendanceSummary(6, 0)).not.toContain('선택 0명')
  })

  it('supports organizer-only required', () => {
    expect(formatAttendanceSummary(1, 5)).toBe('필수 1명 · 선택 5명')
  })
})

describe('mapParticipantsToSetupViewModel', () => {
  it('keeps fixed row order', () => {
    const vm = mapParticipantsToSetupViewModel({
      attendanceTypes: coordinationAttendance,
    })
    expect(vm.rows.map((r) => r.id)).toEqual([
      'minji',
      'jihoon',
      'seoyeon',
      'doyoon',
      'yujin',
      'hyunwoo',
    ])
  })

  it('locks organizer as required', () => {
    const vm = mapParticipantsToSetupViewModel({
      attendanceTypes: {
        ...coordinationAttendance,
        minji: 'optional',
      },
    })
    const organizer = vm.rows[0]
    expect(organizer.attendanceLocked).toBe(true)
    expect(organizer.attendanceType).toBe('required')
    expect(organizer.publicContext.label).toBe('주최자 · 필수 참석')
  })

  it('includes organizer in required count', () => {
    const vm = mapParticipantsToSetupViewModel({
      attendanceTypes: coordinationAttendance,
    })
    expect(vm.requiredCount).toBe(4)
    expect(vm.optionalCount).toBe(2)
    expect(vm.summaryLabel).toBe('필수 4명 · 선택 2명')
  })

  it('does not reorder when toggling optional to required', () => {
    const before = mapParticipantsToSetupViewModel({
      attendanceTypes: coordinationAttendance,
    })
    const after = mapParticipantsToSetupViewModel({
      attendanceTypes: {
        ...coordinationAttendance,
        yujin: 'required',
        hyunwoo: 'required',
      },
    })
    expect(after.rows.map((r) => r.id)).toEqual(before.rows.map((r) => r.id))
    expect(after.summaryLabel).toBe('필수 6명 · 선택 없음')
  })

  it('exposes public context labels without private titles', () => {
    const vm = mapParticipantsToSetupViewModel({
      attendanceTypes: coordinationAttendance,
    })
    const labels = vm.rows.map((r) => r.publicContext.label)
    expect(labels).toContain('개인 보호 시간 있음')
    expect(labels).toContain('점심 직후 회피')
    expect(labels).toContain('화·목 외근')
    expect(labels).toContain('수요일 오후 고객 대응')
    for (const label of labels) {
      expect(assertPublicLabelSafe(label)).toBe(true)
    }
  })
})

describe('mapPrivateScheduleToPublicContext', () => {
  it('never leaks forbidden private labels', () => {
    const result = mapPrivateScheduleToPublicContext({
      participantId: 'jihoon',
      privateLabels: ['병원 진료', '가족 일정', '개인 상담'],
    })
    expect(result.shortLabel).toBe('일정 있음')
    expect(result.shortLabel).not.toContain('병원')
    expect(result.shortLabel).not.toContain('가족')
    expect(result.shortLabel).not.toContain('상담')
  })

  it('maps known hints to public labels', () => {
    expect(
      mapPrivateScheduleToPublicContext({
        participantId: 'x',
        hints: ['lunch-preference'],
      }).shortLabel,
    ).toBe('점심 직후 회피')
  })
})
