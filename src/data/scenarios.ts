import type {
  ConfirmationScenario,
  ReadyScenario,
  RejectedScenario,
  ScenarioId,
} from '@/types/schedule'

export const readyScenario: ReadyScenario = {
  id: 'ready',
  date: '2026-07-15',
  dayLabel: '수요일',
  timeLabel: '오후 3:00–4:00',
  dateDisplay: '7월 15일 수요일',
  requiredAvailable: 4,
  requiredTotal: 4,
  optionalAvailable: 1,
  optionalTotal: 2,
  reasons: [
    '외근 전후 시간을 피했어요.',
    '개인 선호와 겹치는 경우가 가장 적어요.',
  ],
  details: [
    '꼭 참석해야 하는 4명 모두 가능',
    '외근 전후 시간과 겹치지 않음',
    '개인 선호와 겹치는 일정 없음',
    '참석하면 좋은 2명 중 1명 가능',
  ],
  disclosureNote:
    '꼭 참석해야 하는 사람이 모두 가능한 시간을 먼저 찾고, 그다음 일정 충돌과 개인 선호가 적은 순서로 비교했어요.',
}

export const confirmationScenario: ConfirmationScenario = {
  id: 'need-confirmation',
  date: '2026-07-16',
  dayLabel: '목요일',
  timeLabel: '오후 3:00–4:00',
  dateDisplay: '7월 16일 목요일',
  targetParticipantId: 'jihoon',
  targetParticipantName: '이지훈',
  conflictType: '개인 보호 시간',
  requiredAvailable: 3,
  requiredTotal: 4,
  optionalAvailable: 2,
  optionalTotal: 2,
  resultMessage:
    '가능하다고 답하면 꼭 참석해야 하는 4명 모두 만날 수 있어요.',
}

export const rejectedScenario: RejectedScenario = {
  id: 'rejected',
  previousDate: '2026-07-16',
  previousTimeLabel: '오후 3:00–4:00',
  nextDate: '2026-07-17',
  nextDayLabel: '금요일',
  nextTimeLabel: '오전 11:00–12:00',
  nextDateDisplay: '7월 17일 금요일',
  targetParticipantId: 'seoyeon',
  targetParticipantName: '박서연',
  conflictType: '개인 보호 시간',
  requiredAvailable: 3,
  requiredTotal: 4,
  optionalAvailable: 1,
  optionalTotal: 2,
  resultMessage: '확인되면 꼭 참석해야 하는 4명 모두 참석할 수 있어요.',
}

export const scenarioMeta: Record<
  ScenarioId,
  { title: string; description: string }
> = {
  ready: {
    title: '바로 확정 가능한 경우',
    description: '필수 참석자 전원이 가능한 시간을 바로 확정합니다.',
  },
  'need-confirmation': {
    title: '일정 확인이 필요한 경우',
    description: '한 명의 가능 여부 확인 후 확정으로 이어집니다.',
  },
  rejected: {
    title: '확인 요청을 거절한 경우',
    description: '거절 후 다음으로 조율이 적은 대안을 제시합니다.',
  },
}
