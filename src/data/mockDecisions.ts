import type { DecisionCard } from '@/types/decision'

export const mockDecisions: DecisionCard[] = [
  {
    id: 'dec-001',
    title: '점심 배달 주문',
    description: '평일 점심 배달 지출을 한 번 더 검토해볼까요?',
    amount: 14_000,
    category: '식비',
    status: 'collapsed',
    createdAt: '2026-07-12T09:00:00.000Z',
  },
  {
    id: 'dec-002',
    title: '구독 서비스 갱신',
    description: '이번 달 사용량이 적어 해지를 고려해볼 수 있어요.',
    amount: 9_900,
    category: '구독',
    status: 'expanded',
    createdAt: '2026-07-11T14:30:00.000Z',
  },
  {
    id: 'dec-003',
    title: '주말 카페 지출',
    description: '지난주 대비 카페 지출이 늘었어요.',
    amount: 6_500,
    category: '카페',
    status: 'confirming',
    createdAt: '2026-07-10T11:15:00.000Z',
  },
]
