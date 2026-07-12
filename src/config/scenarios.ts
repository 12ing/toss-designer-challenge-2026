import type { ScenarioId } from '@/types/schedule'

/** URL `?scenario=` 값을 내부 ScenarioId로 변환합니다. */
export function parseScenarioParam(value: string | null): ScenarioId {
  if (value === 'ready') return 'ready'
  if (value === 'rejected') return 'rejected'
  // coordination | need-confirmation | 기본
  return 'need-confirmation'
}

export function scenarioToQuery(id: ScenarioId): string {
  if (id === 'ready') return 'ready'
  if (id === 'rejected') return 'rejected'
  return 'coordination'
}
