import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import type { ScenarioPresetId } from '@/features/meeting-decision/engine/decision-engine.types'
import type { DecisionState } from '@/types/schedule'

type ReviewShellProps = {
  children: ReactNode
  visible: boolean
  state: DecisionState
  scenarioId: ScenarioPresetId | null
  onOpenAttendee: () => void
}

/** 제품 UI 밖에 두는 리뷰 전용 내비게이션 */
export function ReviewNav({
  visible,
  state,
  scenarioId,
  onOpenAttendee,
}: Omit<ReviewShellProps, 'children'>) {
  if (!visible) return null

  const showWaitingNav = state === 'waiting'
  const showScenarioNote =
    state === 'participant-setup' ||
    state === 'analyzing' ||
    state === 'ready' ||
    state === 'need-confirmation' ||
    state === 'next-alternative' ||
    state === 'ready-after-confirmation' ||
    state === 'no-option'

  if (!showWaitingNav && !showScenarioNote) return null

  return (
    <div className="mt-6 flex flex-col gap-4">
      {showScenarioNote && (
        <p className="text-center text-[12px] leading-4 text-meeting-text-tertiary">
          대표 시나리오 데이터
          {scenarioId === 'ready'
            ? ' · 바로 확정'
            : scenarioId === 'rejected'
              ? ' · 거절 후 재추천'
              : ' · 조율 필요'}
        </p>
      )}

      {showWaitingNav && (
        <div className="rounded-2xl border border-[#d1d6db] bg-[#eef0f3] px-5 py-5">
          <p className="mb-1 text-[13px] font-semibold text-meeting-text-secondary">
            다음 장면
          </p>
          <p
            className="mb-4 text-[15px] leading-[23px] text-meeting-text"
            style={{ wordBreak: 'keep-all' }}
          >
            참석자에게 알림이 도착했어요.
          </p>
          <Button onClick={onOpenAttendee}>참석자 화면 보기</Button>
        </div>
      )}
    </div>
  )
}

export function ReviewComplete() {
  return (
    <div className="min-h-screen bg-[#eef0f3]">
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col justify-center px-8 py-16">
        <p className="mb-2 text-[13px] font-medium text-meeting-text-tertiary">
          리뷰
        </p>
        <h1
          className="mb-4 text-[26px] font-bold leading-[36px] text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          핵심 플로우를 확인했어요.
        </h1>
        <p
          className="mb-10 text-[16px] leading-6 text-meeting-text-secondary"
          style={{ wordBreak: 'keep-all' }}
        >
          공통 시간이 없는 상황에서도
          <br />
          필요한 확인과 응답을 연결해 회의를 확정했습니다.
        </p>

        <div className="flex flex-col gap-3">
          <Link to="/prototype?scenario=ready" className="block">
            <Button variant="secondary">바로 확정 가능한 경우 보기</Button>
          </Link>
          <Link to="/prototype?scenario=rejected" className="block">
            <Button variant="secondary">거절 후 재추천 보기</Button>
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
          >
            처음으로
          </Link>
        </div>
      </div>
    </div>
  )
}
