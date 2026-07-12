import { mockDecisions } from '@/data/mockDecisions'
import type { DecisionCard, DecisionCardStatus } from '@/types/decision'

const NETWORK_DELAY_MS = 300

function delay(ms = NETWORK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 인메모리 스토어 — 실제 API 연동 시 이 레이어만 교체하면 됩니다. */
let decisions: DecisionCard[] = structuredClone(mockDecisions)

export async function getDecisions(): Promise<DecisionCard[]> {
  await delay()
  return structuredClone(decisions)
}

export async function getDecisionById(
  id: string,
): Promise<DecisionCard | undefined> {
  await delay()
  const decision = decisions.find((item) => item.id === id)
  return decision ? structuredClone(decision) : undefined
}

export async function updateDecisionStatus(
  id: string,
  status: DecisionCardStatus,
): Promise<DecisionCard> {
  await delay()
  const index = decisions.findIndex((item) => item.id === id)
  if (index === -1) {
    throw new Error(`Decision not found: ${id}`)
  }

  decisions[index] = { ...decisions[index], status }
  return structuredClone(decisions[index])
}

/** 개발/테스트용: mock 초기 상태로 되돌립니다. */
export function resetDecisions() {
  decisions = structuredClone(mockDecisions)
}
