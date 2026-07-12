import { describe, expect, it } from 'vitest'
import {
  isIncompleteMeetingText,
  sanitizeMeetingDisplayText,
} from './meeting-display'

describe('meeting display sanitizer', () => {
  it('strips incomplete hangul jamo fragments', () => {
    expect(sanitizeMeetingDisplayText('ㅇㄹ')).toBe('')
    expect(sanitizeMeetingDisplayText('ㅇ르')).toBe('')
    expect(isIncompleteMeetingText('ㅇㄹ')).toBe(true)
  })

  it('keeps real meeting titles and places', () => {
    expect(sanitizeMeetingDisplayText('킥오프 미팅')).toBe('킥오프 미팅')
    expect(sanitizeMeetingDisplayText('4층 A')).toBe('4층 A')
    expect(sanitizeMeetingDisplayText('  https://meet.example.com/a  ')).toBe(
      'https://meet.example.com/a',
    )
  })
})
