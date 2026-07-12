export function RuleOrderExplanation() {
  return (
    <section className="rounded-2xl border border-meeting-divider bg-meeting-panel/50 px-5 py-4">
      <h2 className="mb-3 text-[14px] font-semibold text-meeting-text">
        시간을 고르는 순서
      </h2>
      <ol className="flex flex-col gap-2 text-[13px] leading-5 text-meeting-text-secondary">
        <li>1. 필수 참석자의 이동 불가 충돌이 없는가</li>
        <li>2. 확인이 필요한 사람이 적은가</li>
        <li>3. 필수 참석자의 선호 충돌이 적은가</li>
        <li>4. 선택 참석자가 더 많이 가능한가</li>
        <li>5. 이동과 연속 회의 부담이 적은가</li>
      </ol>
    </section>
  )
}
