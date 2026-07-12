export function RuleOrderExplanation() {
  return (
    <section className="rounded-2xl border border-meeting-divider bg-meeting-panel/50 px-5 py-4">
      <h2 className="mb-3 text-[14px] font-semibold text-meeting-text">
        시간을 비교하는 기준
      </h2>
      <ol className="flex flex-col gap-2 text-[13px] leading-5 text-meeting-text-secondary">
        <li style={{ wordBreak: 'keep-all' }}>
          1. 필수 참석자의 고정 일정과 겹치지 않는 시간
        </li>
        <li style={{ wordBreak: 'keep-all' }}>
          2. 확인이 필요한 사람이 더 적은 시간
        </li>
        <li style={{ wordBreak: 'keep-all' }}>
          3. 필수 참석자의 선호 충돌이 더 적은 시간
        </li>
        <li style={{ wordBreak: 'keep-all' }}>
          4. 선택 참석자가 더 많이 가능한 시간
        </li>
        <li style={{ wordBreak: 'keep-all' }}>
          5. 이동과 연속 회의 부담이 더 적은 시간
        </li>
      </ol>
    </section>
  )
}
