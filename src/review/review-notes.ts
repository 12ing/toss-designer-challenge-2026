import type { ReviewNote, ReviewStep } from './review.types'

/** Shared product philosophy shown in every design-intent drawer. */
export const PRODUCT_PHILOSOPHY =
  '캘린더가 일정 정보를 보여준다면, 이 제품은 합의를 위한 기준과 다음 행동을 제공합니다.'

export const reviewNotesByStep: Record<ReviewStep, ReviewNote> = {
  'attendance-conditions': {
    title: '참석 조건',
    problem:
      '참석자는 이미 정해졌지만, 누가 꼭 참석해야 하는지는 회의마다 달라요.',
    rule: '선택 참석자가 참석하지 못해도 확정을 막지 않지만, 가능한 사람이 더 많은 시간을 우선합니다. 이번 플로우는 주최자가 직접 참석하는 회의를 가정해 주최자는 필수 고정이에요.',
    omitted: '사람 검색과 조직도는 이번 문제의 핵심이 아니어서 제외했어요.',
  },
  'time-recommendation': {
    title: '시간 제안',
    problem: '캘린더를 모두 보여주면 주최자가 다시 비교하고 판단해야 해요.',
    rule: '필수 충돌, 확인 횟수, 선호, 선택 참석 가능 순서로 한 시간을 제안해요.',
    omitted: '캘린더 그리드와 추천 시간 Top 3를 제공하지 않았어요.',
  },
  'confirmation-request': {
    title: '확인 요청',
    problem: '공통 시간이 없을 때 제품 밖에서 개인적으로 양보를 요청하게 돼요.',
    rule: '변경 가능한 보호 시간만 일정 소유자에게 확인하며, 다른 사람의 일정을 자동으로 옮기지 않습니다.',
    omitted: '다른 사람의 일정을 자동으로 이동하지 않아요.',
  },
  'attendee-response': {
    title: '참석자 응답',
    problem:
      '거절 사유를 요구하거나 다른 사람이 기다린다고 알리면 응답 부담이 커져요.',
    rule: '동의와 거절을 동일한 정상 상태로 다루고, 일정 내용과 사유를 공개하지 않아요.',
    omitted: '거절 사유 입력과 사회적 압박 문구를 넣지 않았어요.',
  },
  'meeting-confirmation': {
    title: '회의 확정',
    problem: '응답이 실제 그룹 결과에 반영됐는지 알기 어려울 수 있어요.',
    rule: '같은 결정 엔진이 다시 계산하고 사람 행의 상태만 제자리에서 바꿔요.',
    omitted: '누가 양보했는지 주최자에게 강조하지 않아요.',
  },
}
