import { useId, useState } from 'react'

const OMITTED_ITEMS = [
  '캘린더 그리드',
  '추천 시간 Top 3',
  '수동 시간 투표',
  '다른 사람 일정 자동 이동',
  '개인 일정 제목 공개',
  '거절 사유 입력',
  '부분 참석과 회의 요약',
  '사람 검색과 조직도',
]

export function OmittedScopeSection() {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <section className="border-t border-meeting-divider pt-6">
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-[14px] font-semibold text-meeting-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--meeting-focus)]"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
      >
        의도적으로 만들지 않은 것
        <span className="text-[13px] font-medium text-meeting-text-tertiary">
          {open ? '접기' : '펼치기'}
        </span>
      </button>
      {open ? (
        <div id={panelId} className="mt-4">
          <p
            className="mb-4 text-[14px] leading-[21px] text-meeting-text-secondary"
            style={{ wordBreak: 'keep-all' }}
          >
            회의 시간을 찾는 기능 전체가 아니라, 여러 조건 사이에서 공정하게 한
            시간을 결정하는 문제에 집중했습니다.
          </p>
          <ul className="flex flex-col gap-2">
            {OMITTED_ITEMS.map((item) => (
              <li
                key={item}
                className="text-[14px] leading-[21px] text-meeting-text-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
