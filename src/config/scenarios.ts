import type { ScenarioPresetId } from '@/features/meeting-decision/engine/decision-engine.types'

/** URL `?scenario=` → 프리셋 ID (입력 시드만, 결과 결정 아님) */
export function parseScenarioParam(value: string | null): ScenarioPresetId {
  if (value === 'ready') return 'ready'
  if (value === 'rejected') return 'rejected'
  return 'coordination'
}

export function scenarioToQuery(id: ScenarioPresetId): string {
  return id
}
