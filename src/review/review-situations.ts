import type { MeetingDecisionSession } from '@/features/meeting-decision/connected-flow/connected-flow.types'

export type ReviewSituationId =
  | 'core'
  | 'ready'
  | 'decline'
  | 'lab'
  | 'landing'

export type ReviewSituationItem = {
  id: ReviewSituationId
  title: string
  description: string
}

export type ReviewSituationGroup = {
  id: string
  label: string
  items: ReviewSituationItem[]
}

const SITUATION_HINT_KEY = 'toss-challenge.review-situation-hint'

/** In-memory mirror so hint works without DOM storage (tests) and after set. */
let situationHint: ReviewSituationId | null = null

export const REVIEW_SITUATION_GROUPS: ReviewSituationGroup[] = [
  {
    id: 'core-flow',
    label: '핵심 흐름',
    items: [
      {
        id: 'core',
        title: '핵심 흐름 처음부터',
        description: '공통 시간이 없는 상황에서 시작해요.',
      },
    ],
  },
  {
    id: 'other-outcomes',
    label: '다른 결과',
    items: [
      {
        id: 'ready',
        title: '바로 확정되는 경우',
        description: '추가 확인 없이 회의를 확정해요.',
      },
      {
        id: 'decline',
        title: '거절 후 다시 찾는 경우',
        description: '거절 응답을 반영해 다음 시간을 찾아요.',
      },
    ],
  },
  {
    id: 'design-check',
    label: '설계 확인',
    items: [
      {
        id: 'lab',
        title: '결정 규칙 확인하기',
        description: '조건을 바꿔 추천 결과를 비교해요.',
      },
      {
        id: 'landing',
        title: '과제 소개',
        description: '문제 정의와 핵심 경험으로 돌아가요.',
      },
    ],
  },
]

export function setReviewSituationHint(id: ReviewSituationId): void {
  situationHint = id
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SITUATION_HINT_KEY, id)
  } catch {
    // ignore quota / private mode
  }
}

export function getReviewSituationHint(): ReviewSituationId | null {
  if (situationHint) return situationHint
  if (typeof window === 'undefined') return null
  try {
    const value = sessionStorage.getItem(SITUATION_HINT_KEY)
    if (
      value === 'core' ||
      value === 'ready' ||
      value === 'decline' ||
      value === 'lab' ||
      value === 'landing'
    ) {
      situationHint = value
      return value
    }
  } catch {
    return null
  }
  return null
}

/**
 * Core and decline review branches both seed `coordination` so reviewers walk
 * a real path. Hint storage distinguishes which branch the reviewer opened.
 */
export function resolveCurrentReviewSituation(
  pathname: string,
  session: MeetingDecisionSession | null,
): ReviewSituationId | null {
  if (pathname === '/lab' || pathname.startsWith('/lab/')) {
    return 'lab'
  }

  if (pathname === '/' || pathname === '') {
    return 'landing'
  }

  // Completion / scenario hub — no scenario marked current.
  if (
    pathname.startsWith('/review/session/') &&
    pathname.includes('/complete')
  ) {
    return null
  }

  if (pathname === '/review/scenarios' || pathname.startsWith('/review/scenarios/')) {
    return null
  }

  if (!session) {
    return getReviewSituationHint()
  }

  if (session.scenarioSeed === 'ready') {
    return 'ready'
  }

  if (session.scenarioSeed === 'rejected') {
    return 'decline'
  }

  if (session.scenarioSeed === 'coordination') {
    const hint = getReviewSituationHint()
    if (hint === 'decline' || hint === 'core') {
      return hint
    }
    return 'core'
  }

  return getReviewSituationHint() ?? 'core'
}

export function flattenSituationItems(): ReviewSituationItem[] {
  return REVIEW_SITUATION_GROUPS.flatMap((group) => group.items)
}
