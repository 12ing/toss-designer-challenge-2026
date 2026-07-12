import { attachSchedules } from './schedule-fixtures'
import type { DecisionParticipant } from '../engine/decision-engine.types'

const baseParticipants: Omit<DecisionParticipant, 'schedule'>[] = [
  {
    id: 'minji',
    name: '김민지',
    role: 'PO',
    isOrganizer: true,
    defaultAttendanceType: 'required',
    contextSummary: '주최자 · 필수 고정',
  },
  {
    id: 'jihoon',
    name: '이지훈',
    role: '백엔드 개발자',
    isOrganizer: false,
    defaultAttendanceType: 'required',
    contextSummary: '개인 보호 시간 있음',
  },
  {
    id: 'seoyeon',
    name: '박서연',
    role: '프로덕트 디자이너',
    isOrganizer: false,
    defaultAttendanceType: 'required',
    contextSummary: '점심 직후 선호하지 않음',
  },
  {
    id: 'doyoon',
    name: '최도윤',
    role: '보안 분석가',
    isOrganizer: false,
    defaultAttendanceType: 'required',
    contextSummary: '화·목 외근',
  },
  {
    id: 'yujin',
    name: '정유진',
    role: '데이터 분석가',
    isOrganizer: false,
    defaultAttendanceType: 'optional',
  },
  {
    id: 'hyunwoo',
    name: '한현우',
    role: '운영 담당자',
    isOrganizer: false,
    defaultAttendanceType: 'optional',
    contextSummary: '수요일 오후 고객 대응',
  },
]

export const decisionParticipants: DecisionParticipant[] =
  attachSchedules(baseParticipants)

/** UI 행용 — attendanceType은 프리셋/편집 상태로 덮어씀 */
export const participants = decisionParticipants.map((p) => ({
  id: p.id,
  name: p.name,
  role: p.role,
  attendanceType: p.defaultAttendanceType,
  isOrganizer: p.isOrganizer,
}))
