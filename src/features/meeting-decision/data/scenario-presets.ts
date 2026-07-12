import type {
  AttendanceType,
  ResponseOverrides,
  ScenarioPreset,
  ScenarioPresetId,
} from '../engine/decision-engine.types'

export const coordinationAttendance: Record<string, AttendanceType> = {
  minji: 'required',
  jihoon: 'required',
  seoyeon: 'required',
  doyoon: 'required',
  yujin: 'optional',
  hyunwoo: 'optional',
}

export const readyAttendance: Record<string, AttendanceType> = {
  minji: 'required',
  jihoon: 'optional',
  seoyeon: 'required',
  doyoon: 'required',
  yujin: 'optional',
  hyunwoo: 'optional',
}

export const rejectedOverrides: ResponseOverrides = {
  jihoon: {
    'thu-15': 'declined',
  },
}

export const scenarioPresets: Record<ScenarioPresetId, ScenarioPreset> = {
  coordination: {
    id: 'coordination',
    attendanceTypes: { ...coordinationAttendance },
    responseOverrides: {},
  },
  ready: {
    id: 'ready',
    attendanceTypes: { ...readyAttendance },
    responseOverrides: {},
  },
  rejected: {
    id: 'rejected',
    attendanceTypes: { ...coordinationAttendance },
    responseOverrides: structuredClone(rejectedOverrides),
  },
}

export function getScenarioPreset(id: ScenarioPresetId): ScenarioPreset {
  const preset = scenarioPresets[id]
  return {
    id: preset.id,
    attendanceTypes: { ...preset.attendanceTypes },
    responseOverrides: structuredClone(preset.responseOverrides),
  }
}
