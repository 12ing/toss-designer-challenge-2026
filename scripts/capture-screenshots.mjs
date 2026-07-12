import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-v2')

async function shot(page, name, options = {}) {
  const file = path.join(OUT, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true, ...options })
  console.log('saved', name)
}

async function waitVisible(page, text, timeout = 5000) {
  await page.getByText(text, { exact: false }).first().waitFor({
    state: 'visible',
    timeout,
  })
  await page.waitForTimeout(450)
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
  })

  const page = await desktop.newPage()

  // 1. 리뷰 랜딩
  await page.goto(`${BASE}/`)
  await waitVisible(page, '6명의 일정을 비교하지 않고')
  await shot(page, '01-review-landing')

  // 2. 참석 조건
  await page.goto(`${BASE}/prototype?scenario=coordination`)
  await waitVisible(page, '참석 조건을 확인해주세요')
  await shot(page, '02-participant-setup')

  // 3. 분석 중
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(page, '필수 참석자가 모두 가능한 시간을 찾고 있어요.')
  await shot(page, '03-analyzing')

  // 6. 조율 필요
  await waitVisible(page, '확인 한 번이면 필수 참석자 모두 가능해요.')
  await shot(page, '06-need-confirmation')

  // 7. 대기 + ReviewShell
  await page.getByRole('button', { name: '확인 요청하기' }).click()
  await page.getByRole('button', { name: '확인 요청 보내기' }).click()
  await waitVisible(page, '응답을 기다리고 있어요.')
  await waitVisible(page, '다음 장면')
  await shot(page, '07-waiting-reviewshell')

  // 8–9. 참석자 모바일
  const attendeePage = await mobile.newPage()
  await attendeePage.goto(`${BASE}/prototype?scenario=coordination`)
  await attendeePage.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(attendeePage, '확인 한 번이면 필수 참석자 모두 가능해요.')
  await attendeePage.getByRole('button', { name: '확인 요청하기' }).click()
  await attendeePage.getByRole('button', { name: '확인 요청 보내기' }).click()
  await waitVisible(attendeePage, '응답을 기다리고 있어요.')
  await attendeePage.getByRole('button', { name: '참석자 화면 보기' }).click()
  await waitVisible(attendeePage, '이 시간, 괜찮으세요?')
  await shot(attendeePage, '08-attendee-request')

  await attendeePage.getByRole('button', { name: '이 시간 사용 가능' }).click()
  await waitVisible(attendeePage, '가능하다고 전달했어요.')
  await shot(attendeePage, '09-attendee-approved')

  // 10. 확정 가능
  await page.goto(`${BASE}/prototype?scenario=coordination`)
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(page, '확인 한 번이면 필수 참석자 모두 가능해요.')
  await page.getByRole('button', { name: '확인 요청하기' }).click()
  await page.getByRole('button', { name: '확인 요청 보내기' }).click()
  await page.getByRole('button', { name: '참석자 화면 보기' }).click()
  await page.getByRole('button', { name: '이 시간 사용 가능' }).click()
  await page.getByRole('button', { name: '확인' }).click()
  await waitVisible(page, '바로 확정할 수 있어요.')
  await shot(page, '10-ready-after-confirmation')

  // 12. 리뷰 완료
  await page.getByRole('button', { name: '이 시간으로 확정' }).click()
  await page.getByRole('button', { name: '회의 만들기' }).click()
  await page.getByRole('button', { name: '완료' }).click()
  await waitVisible(page, '핵심 흐름를 확인했어요.')
  await shot(page, '12-review-complete')

  // 4–5. 정상 추천
  await page.goto(`${BASE}/prototype?scenario=ready`)
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(page, '바로 확정할 수 있어요.')
  await shot(page, '04-ready-collapsed')

  await page.getByRole('button', { name: '이 시간인 이유' }).click()
  await waitVisible(page, '이유 숨기기')
  await waitVisible(page, '이동 일정')
  await page.locator('dd', { hasText: '외근 전후와 겹치지 않음' }).waitFor({
    state: 'visible',
  })
  await page.waitForTimeout(300)
  await shot(page, '05-ready-expanded')

  // 11. 다음 대안 — rejected는 바로 next-alternative
  await page.goto(`${BASE}/prototype?scenario=rejected`)
  await waitVisible(page, '다음으로 조율이 적은 시간을 찾았어요.')
  await waitVisible(page, '박서연')
  await shot(page, '11-next-alternative')

  await browser.close()
  console.log('done →', OUT)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
