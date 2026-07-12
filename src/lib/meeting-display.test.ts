import { describe, expect, it } from 'vitest'
import {
  isMeetingTitleValid,
  normalizeMeetingLocation,
  normalizeMeetingTitle,
} from './meeting-display'

describe('meeting title validation', () => {
  it('accepts any non-whitespace title including jamo and symbols', () => {
    expect(isMeetingTitleValid('ㅇㄴㅇ')).toBe(true)
    expect(isMeetingTitleValid('ㅇ르')).toBe(true)
    expect(isMeetingTitleValid('A')).toBe(true)
    expect(isMeetingTitleValid('!')).toBe(true)
    expect(isMeetingTitleValid('😀')).toBe(true)
    expect(isMeetingTitleValid('  제품 킥오프  ')).toBe(true)
    expect(normalizeMeetingTitle('  제품 킥오프  ')).toBe('제품 킥오프')
  })

  it('rejects empty and whitespace-only titles', () => {
    expect(isMeetingTitleValid('')).toBe(false)
    expect(isMeetingTitleValid('   ')).toBe(false)
    expect(isMeetingTitleValid('\t')).toBe(false)
    expect(isMeetingTitleValid('\n')).toBe(false)
    expect(normalizeMeetingTitle('   ')).toBe('')
  })

  it('trims location without rejecting content', () => {
    expect(normalizeMeetingLocation('  4층 A  ')).toBe('4층 A')
    expect(normalizeMeetingLocation('ㅇㄹ')).toBe('ㅇㄹ')
  })
})
