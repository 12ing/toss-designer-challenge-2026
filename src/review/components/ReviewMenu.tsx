import { useNavigate } from 'react-router-dom'
import {
  organizerPath,
  startCoreReviewSession,
  startDeclineBranchSession,
  startReadyReviewSession,
} from '@/review/review-session.factory'

type ReviewMenuProps = {
  onNavigate?: () => void
}

export function ReviewMenu({ onNavigate }: ReviewMenuProps) {
  const navigate = useNavigate()

  const go = (factory: () => { id: string }) => {
    const session = factory()
    onNavigate?.()
    navigate(organizerPath(session.id))
  }

  return (
    <ul className="flex flex-col gap-1" aria-label="다른 장면">
      <li>
        <button
          type="button"
          className="inline-flex min-h-10 w-full items-center rounded-lg px-2 text-left text-[14px] font-medium text-meeting-text-secondary hover:bg-meeting-panel"
          onClick={() => go(startCoreReviewSession)}
        >
          핵심 플로우 처음부터
        </button>
      </li>
      <li>
        <button
          type="button"
          className="inline-flex min-h-10 w-full items-center rounded-lg px-2 text-left text-[14px] font-medium text-meeting-text-secondary hover:bg-meeting-panel"
          onClick={() => go(startReadyReviewSession)}
        >
          바로 확정 가능한 경우
        </button>
      </li>
      <li>
        <button
          type="button"
          className="inline-flex min-h-10 w-full items-center rounded-lg px-2 text-left text-[14px] font-medium text-meeting-text-secondary hover:bg-meeting-panel"
          onClick={() => go(startDeclineBranchSession)}
        >
          거절 후 재추천
        </button>
      </li>
      <li>
        <a
          href="/lab"
          className="inline-flex min-h-10 w-full items-center rounded-lg px-2 text-[14px] font-medium text-meeting-text-secondary hover:bg-meeting-panel"
          onClick={onNavigate}
        >
          결정 규칙 실험하기
        </a>
      </li>
      <li>
        <a
          href="/"
          className="inline-flex min-h-10 w-full items-center rounded-lg px-2 text-[14px] font-medium text-meeting-text-secondary hover:bg-meeting-panel"
          onClick={onNavigate}
        >
          리뷰 랜딩
        </a>
      </li>
    </ul>
  )
}
