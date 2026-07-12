import { useCallback, useEffect, useState } from 'react'
import {
  getDecisions,
  updateDecisionStatus,
} from '@/api/decisions'
import type { DecisionCard, DecisionCardStatus } from '@/types/decision'

export function useDecisions() {
  const [decisions, setDecisions] = useState<DecisionCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getDecisions()
      setDecisions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load decisions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const setStatus = useCallback(
    async (id: string, status: DecisionCardStatus) => {
      const updated = await updateDecisionStatus(id, status)
      setDecisions((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      )
      return updated
    },
    [],
  )

  return { decisions, isLoading, error, reload: load, setStatus }
}
