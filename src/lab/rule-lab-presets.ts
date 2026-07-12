import type { AttendanceType } from '@/features/meeting-decision/engine/decision-engine.types'
import {
  coordinationAttendance,
  readyAttendance,
} from '@/features/meeting-decision/data/scenario-presets'

export type LabPresetId =
  | 'coordination'
  | 'ready'
  | 'all-required'
  | 'organizer-only'

export type LabPreset = {
  id: LabPresetId
  label: string
  attendanceTypes: Record<string, AttendanceType>
}

export const allRequiredAttendance: Record<string, AttendanceType> = {
  minji: 'required',
  jihoon: 'required',
  seoyeon: 'required',
  doyoon: 'required',
  yujin: 'required',
  hyunwoo: 'required',
}

export const organizerOnlyAttendance: Record<string, AttendanceType> = {
  minji: 'required',
  jihoon: 'optional',
  seoyeon: 'optional',
  doyoon: 'optional',
  yujin: 'optional',
  hyunwoo: 'optional',
}

export const labPresets: LabPreset[] = [
  {
    id: 'coordination',
    label: '확인 요청 필요',
    attendanceTypes: { ...coordinationAttendance },
  },
  {
    id: 'ready',
    label: '바로 확정',
    attendanceTypes: { ...readyAttendance },
  },
  {
    id: 'all-required',
    label: '모두 필수',
    attendanceTypes: { ...allRequiredAttendance },
  },
  {
    id: 'organizer-only',
    label: '주최자만 필수',
    attendanceTypes: { ...organizerOnlyAttendance },
  },
]

export function getLabPreset(id: LabPresetId): LabPreset {
  return labPresets.find((preset) => preset.id === id) ?? labPresets[0]!
}
