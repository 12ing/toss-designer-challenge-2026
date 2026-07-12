import type {
  DecisionParticipant,
  SlotState,
  SoftConstraintKind,
  TimeSlotId,
} from '../engine/decision-engine.types'

const free = (): SlotState => ({ type: 'free' })

const hard = (publicLabel: string): SlotState => ({
  type: 'hard-busy',
  publicLabel,
})

const protectedSlot = (): SlotState => ({
  type: 'protected',
  requestable: true,
  publicLabel: '개인 보호 시간',
})

const soft = (
  penalty: number,
  kind: SoftConstraintKind,
  publicLabel: string,
): SlotState => ({
  type: 'soft-penalty',
  kind,
  penalty,
  publicLabel,
})

/** 문서 매트릭스 (UI용 publicLabel만 보관) */
export const scheduleByParticipant: Record<
  string,
  Partial<Record<TimeSlotId, SlotState>>
> = {
  minji: {
    'mon-10': hard('일정 있음'),
    'mon-16': free(),
    'tue-13': free(),
    'wed-15': free(),
    'thu-10': hard('일정 있음'),
    'thu-15': free(),
    'fri-11': free(),
    'fri-16': hard('일정 있음'),
  },
  jihoon: {
    'mon-10': free(),
    'mon-16': hard('일정 있음'),
    'tue-13': free(),
    'wed-15': hard('일정 있음'),
    'thu-10': free(),
    'thu-15': protectedSlot(),
    'fri-11': free(),
    'fri-16': free(),
  },
  seoyeon: {
    'mon-10': free(),
    'mon-16': free(),
    'tue-13': soft(3, 'preference', '점심 직후 회피'),
    'wed-15': hard('일정 있음'),
    'thu-10': free(),
    'thu-15': free(),
    'fri-11': protectedSlot(),
    'fri-16': free(),
  },
  doyoon: {
    'mon-10': hard('일정 있음'),
    'mon-16': soft(2, 'meeting-density', '연속 회의'),
    'tue-13': hard('외근'),
    'wed-15': hard('외근'),
    'thu-10': hard('외근'),
    'thu-15': soft(1, 'travel', '외근 이후 이동'),
    'fri-11': soft(2, 'meeting-density', '연속 회의'),
    'fri-16': free(),
  },
  yujin: {
    'mon-10': free(),
    'mon-16': free(),
    'tue-13': hard('일정 있음'),
    'wed-15': free(),
    'thu-10': hard('일정 있음'),
    'thu-15': free(),
    'fri-11': free(),
    'fri-16': free(),
  },
  hyunwoo: {
    'mon-10': hard('고객 대응'),
    'mon-16': free(),
    'tue-13': free(),
    'wed-15': hard('고객 대응'),
    'thu-10': free(),
    'thu-15': free(),
    'fri-11': free(),
    'fri-16': protectedSlot(),
  },
}

export function attachSchedules(
  base: Omit<DecisionParticipant, 'schedule'>[],
): DecisionParticipant[] {
  return base.map((person) => ({
    ...person,
    schedule: scheduleByParticipant[person.id] ?? {},
  }))
}
