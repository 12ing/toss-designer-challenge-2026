import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useFocusPageHeading } from '@/hooks/useFocusPageHeading'
import { navigateReviewSituation } from '@/review/navigate-review-situation'
import { isReviewMode, isUserTestMode } from '@/review/review-mode'

type ScenarioRow = {
  id: 'ready' | 'decline' | 'lab'
  title: string
  description: string
  actionHint: string
}

const SCENARIO_ROWS: ScenarioRow[] = [
  {
    id: 'ready',
    title: '바로 확정되는 경우',
    description: '추가 확인 없이 회의를 바로 확정해요.',
    actionHint: '살펴보기',
  },
  {
    id: 'decline',
    title: '거절 후 다시 찾는 경우',
    description: '거절 응답을 반영해 다음 시간을 찾아요.',
    actionHint: '살펴보기',
  },
  {
    id: 'lab',
    title: '결정 규칙 확인하기',
    description: '조건을 바꿔 추천 결과를 비교해보세요.',
    actionHint: '확인하기',
  },
]

function ChevronIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className="h-5 w-5 shrink-0 text-meeting-text-tertiary"
    >
      <path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ReviewScenarios() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const headingRef = useFocusPageHeading('review-scenarios')

  if (isUserTestMode(searchParams) || !isReviewMode(searchParams)) {
    return <Navigate to="/" replace />
  }

  const go = (id: ScenarioRow['id'] | 'core' | 'landing') => {
    navigateReviewSituation(id, null, navigate)
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-meeting-bg">
      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 min-[720px]:px-8 min-[720px]:pb-20 min-[720px]:pt-16">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mb-3 text-[26px] font-bold leading-[36px] text-meeting-text outline-none focus:outline-none focus-visible:outline-none min-[720px]:text-[28px] min-[720px]:leading-[38px]"
          style={{ wordBreak: 'keep-all' }}
        >
          다른 상황도 살펴보세요
        </h1>
        <p
          className="mb-9 text-[15px] leading-[23px] text-meeting-text-secondary min-[720px]:mb-10 min-[720px]:text-[16px] min-[720px]:leading-6"
          style={{ wordBreak: 'keep-all' }}
        >
          같은 결정 기준이 조건에 따라
          <br />
          어떻게 다른 결과로 이어지는지 확인할 수 있어요.
        </p>

        <ul className="flex flex-col gap-3">
          {SCENARIO_ROWS.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                className="flex w-full items-start gap-3 rounded-2xl border border-meeting-divider bg-meeting-surface px-5 py-[18px] text-left transition-colors hover:bg-meeting-panel focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
                onClick={() => go(row.id)}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold leading-6 text-meeting-text">
                    {row.title}
                  </span>
                  <span
                    className="mt-1 block text-[13px] leading-5 text-meeting-text-tertiary"
                    style={{ wordBreak: 'keep-all' }}
                  >
                    {row.description}
                  </span>
                  <span className="sr-only">{row.actionHint}</span>
                </span>
                <ChevronIcon />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col items-start gap-3">
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
            onClick={() => go('core')}
          >
            핵심 흐름 다시 보기
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
            onClick={() => go('landing')}
          >
            과제 소개로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}
