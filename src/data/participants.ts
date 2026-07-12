import type { Participant } from '@/types/schedule'

export const participants: Participant[] = [
  {
    id: 'minji',
    name: '김민지',
    role: 'PO',
    attendanceType: 'required',
    isOrganizer: true,
  },
  {
    id: 'jihoon',
    name: '이지훈',
    role: '백엔드 개발자',
    attendanceType: 'required',
  },
  {
    id: 'seoyeon',
    name: '박서연',
    role: '프로덕트 디자이너',
    attendanceType: 'required',
  },
  {
    id: 'doyoon',
    name: '최도윤',
    role: '보안 분석가',
    attendanceType: 'required',
  },
  {
    id: 'yujin',
    name: '정유진',
    role: '데이터 분석가',
    attendanceType: 'optional',
  },
  {
    id: 'hyunwoo',
    name: '한현우',
    role: '운영 담당자',
    attendanceType: 'optional',
  },
]
