/** Review-only UX writing — not shown in product/usertest flows. */

export const reviewCopy = {
  chrome: {
    designRationale: '설계 근거',
    situationSelect: '상황 선택',
    currentStep: '현재 단계',
    philosophy: '제품 철학',
    problem: '설계한 문제',
    rule: '적용한 규칙',
    omitted: '의도적으로 만들지 않은 것',
    close: '닫기',
  },
  philosophy:
    '캘린더가 일정 정보를 보여준다면, 이 제품은 합의를 위한 기준과 다음 행동을 제공해요.',
  landing: {
    eyebrow: 'Toss Product Designer Challenge 2026',
    title:
      '회의 시간은 모두가 비는 순간이 아니라,\n무엇을 먼저 지킬지 정할 때 확정돼요.',
    body: '필수 참석은 지키고, 외근과 개인 선호는 필요한 만큼 반영해\n지금 확정할 수 있는 한 시간과 다음 행동을 제안했어요.',
    primaryAction: '핵심 흐름 시작',
    helper: '약 2분 · 필수 참석자의 공통 시간이 없는 상황부터 시작해요',
    labLink: '결정 규칙 확인하기 →',
  },
  completion: {
    eyebrow: '핵심 흐름 완료',
    title: '공통 시간이 없어도\n회의 시간을 확정했어요.',
    body: '필수 참석 조건을 먼저 지키고,\n필요한 사람에게만 확인한 뒤\n응답 결과를 같은 기준으로 다시 계산했어요.',
    primaryAction: '다른 상황 살펴보기',
    secondaryAction: '과제 소개로 돌아가기',
    pickerEyebrow: '다른 상황',
    pickerTitle: '다른 결과도 살펴보세요',
    pickerDescription:
      '같은 기준이 조건에 따라\n어떻게 다른 결과로 이어지는지 확인해보세요.',
    backToSummary: '완료 내용으로 돌아가기',
  },
  scenarios: {
    ready: {
      title: '바로 확정되는 경우',
      description: '추가 확인 없이 회의를 바로 확정해요.',
    },
    decline: {
      title: '거절 후 다시 찾는 경우',
      description: '거절 응답을 반영해 다음 시간을 찾아요.',
    },
    lab: {
      title: '결정 규칙 확인하기',
      description: '조건을 바꿔 추천 결과를 비교해보세요.',
    },
    backToIntro: '과제 소개로 돌아가기',
  },
  actorTransition: {
    toAttendeeTitle: (name: string) =>
      `${name} 님에게 확인 요청을 보냈어요.`,
    toAttendeeDescription: '참석자 화면에서 응답 과정을 확인해보세요.',
    toAttendeeCta: '참석자 응답 보기',
    toOrganizerTitle: '응답이 주최자에게 반영됐어요.',
    toOrganizerDescription: '주최자 화면에서 바뀐 결과를 확인해보세요.',
    toOrganizerCta: '주최자 결과 보기',
  },
  lab: {
    eyebrow: '결정 규칙 확인',
    title: '조건을 바꾸면 같은 기준으로 다시 계산해요.',
    description:
      '필수·선택 조건에 따라\n추천 시간과 다음 행동이 어떻게 달라지는지 확인해보세요.',
    back: '과제 소개로 돌아가기',
    reset: '초기화',
    jumpToResult: '계산 결과 보기',
    criteriaTitle: '시간을 비교하는 기준',
    criteriaCollapse: '기준 접기',
    criteriaExpand: '시간을 비교하는 기준 보기',
    criteria: [
      '1. 필수 참석자의 고정 일정과 겹치지 않는 시간',
      '2. 확인이 필요한 사람이 더 적은 시간',
      '3. 필수 참석자의 선호 충돌이 더 적은 시간',
      '4. 선택 참석자가 더 많이 가능한 시간',
      '5. 이동과 연속 회의 부담이 더 적은 시간',
    ],
    presets: {
      coordination: '확인 요청 필요',
      ready: '바로 확정',
      allRequired: '모두 필수',
      organizerOnly: '주최자만 필수',
    },
    resultEyebrow: '계산된 결과',
  },
} as const
