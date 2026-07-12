/** DecisionCard UI 상태 (기획서 1–3, 3번) */
export type DecisionCardStatus =
  | 'collapsed'
  | 'expanded'
  | 'confirming'
  | 'confirmed'
  | 'dismissed'

export interface DecisionCard {
  id: string
  title: string
  description: string
  amount: number
  category: string
  status: DecisionCardStatus
  createdAt: string
}
