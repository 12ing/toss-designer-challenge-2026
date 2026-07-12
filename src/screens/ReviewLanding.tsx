import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function ReviewLanding() {
  return (
    <div className="min-h-screen bg-meeting-bg">
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col justify-center px-8 py-16">
        <p className="mb-4 text-[13px] font-medium leading-5 tracking-wide text-meeting-text-tertiary">
          Toss Product Designer Challenge 2026
        </p>

        <h1
          className="mb-4 text-[28px] font-bold leading-[40px] tracking-tight text-meeting-text"
          style={{ wordBreak: 'keep-all' }}
        >
          6명의 일정을 비교하지 않고, 가장 적은 조율로 회의를 확정합니다.
        </h1>

        <p
          className="mb-6 text-[16px] leading-6 text-meeting-text-secondary"
          style={{ wordBreak: 'keep-all' }}
        >
          필수 참석, 외근, 개인 선호를 하나의 기준으로 정리해 한 시간과 필요한
          다음 행동을 제안했습니다.
        </p>

        <p className="mb-8 text-[14px] leading-[21px] text-meeting-text-secondary">
          추천 → 확인 요청 → 참석자 응답 → 확정
        </p>

        <div className="mb-12">
          <Link to="/prototype?scenario=coordination" className="block">
            <Button>핵심 플로우 시작</Button>
          </Link>
          <p className="mt-3 text-[13px] leading-5 text-meeting-text-tertiary">
            약 2분 · 공통 시간이 없는 상황부터 시작해요
          </p>
        </div>

        <section>
          <h2 className="mb-3 text-[14px] font-semibold text-meeting-text-secondary">
            다른 상황 바로 보기
          </h2>
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                to="/prototype?scenario=ready"
                className="inline-flex min-h-11 items-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
              >
                바로 확정
              </Link>
            </li>
            <li>
              <Link
                to="/prototype?scenario=rejected"
                className="inline-flex min-h-11 items-center text-[15px] font-medium text-meeting-text-secondary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
              >
                거절 후 재추천
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
