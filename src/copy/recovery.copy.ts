/** Flow recovery / error UX writing. */

export const recoveryCopy = {
  sessionMissing: {
    title: '진행 중이던 내용을 찾을 수 없어요.',
    description: '링크가 만료됐거나 잘못된 주소일 수 있어요.',
    action: '처음부터 다시 시작',
  },
  meetingExists: {
    title: '이미 만든 회의가 있어요.',
    description: '앞서 만든 회의 정보를 다시 확인할 수 있어요.',
    action: '회의 보기',
  },
  recommendationInvalid: {
    title: '추천한 시간이 더 이상 유효하지 않아요.',
    description: '현재 참석 조건으로 시간을 다시 찾아주세요.',
    action: '시간 다시 찾기',
  },
  meetingMissing: {
    title: '회의 정보를 불러올 수 없어요.',
    description: '처음부터 다시 시작해 주세요.',
    action: '처음부터 다시 시작',
  },
  requestMissing: {
    title: '확인 요청을 찾을 수 없어요.',
    description: '링크가 만료됐거나 잘못된 요청일 수 있어요.',
    action: '처음부터 다시 시작',
  },
} as const
