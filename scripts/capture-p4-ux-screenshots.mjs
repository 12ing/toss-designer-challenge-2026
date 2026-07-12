import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-p4-ux')

async function shot(page, name) {
  await page.waitForTimeout(300)
  await page.screenshot({
    path: path.join(OUT, `${name}.png`),
    fullPage: true,
  })
  console.log('saved', name)
}

async function waitVisible(page, text) {
  await page
    .getByText(text, { exact: false })
    .filter({ visible: true })
    .first()
    .waitFor({ state: 'visible', timeout: 12000 })
}

async function seedPendingRequest(page) {
  await page.goto(`${BASE}/`)
  await page.evaluate(() => sessionStorage.clear())
  await page.goto(`${BASE}/prototype?scenario=coordination`)
  await waitVisible(page, '참석 조건을 확인해주세요')
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(page, '확인 한 번이면')
  await page.getByRole('button', { name: '가능 여부 묻기' }).click()
  await page.getByRole('button', { name: '요청 보내기' }).click()
  await waitVisible(page, '응답을 기다리고 있어요.')
  return page.evaluate(() => {
    const raw = sessionStorage.getItem('toss-meeting-decision-session-v1')
    const session = raw ? JSON.parse(raw) : null
    return {
      storage: raw,
      requestId: session?.activeRequest?.id,
    }
  })
}

async function openAttendee(browser, storage, requestId, query = '') {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/`)
  await page.evaluate((value) => {
    sessionStorage.setItem('toss-meeting-decision-session-v1', value)
  }, storage)
  await page.goto(
    `${BASE}/prototype/respond/${requestId}?scenario=coordination${query}`,
  )
  await waitVisible(page, '이 시간, 괜찮으세요?')
  return { ctx, page }
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const organizer = await desktop.newPage()

  // 1. equal buttons
  const seed1 = await seedPendingRequest(organizer)
  const a1 = await openAttendee(browser, seed1.storage, seed1.requestId)
  await shot(a1.page, '01-attendee-equal-buttons')

  // 7. keyboard focus
  await a1.page.getByRole('button', { name: '이 시간 사용 가능' }).focus()
  await a1.page.waitForTimeout(200)
  await shot(a1.page, '07-keyboard-focus')

  // 2. approve complete without review shell
  await a1.page.getByRole('button', { name: '이 시간 사용 가능' }).click()
  await waitVisible(a1.page, '가능하다고 전달했어요.')
  await a1.page.getByRole('button', { name: '확인' }).waitFor({ state: 'visible' })
  const reviewDuringResult = await a1.page
    .getByText('응답이 주최자에게 반영됐어요.')
    .count()
  if (reviewDuringResult > 0) {
    console.warn('warning: review transition visible during product result')
  }
  await shot(a1.page, '02-approve-complete-no-review')

  // 3. after confirm → review transition
  await a1.page.getByRole('button', { name: '확인' }).click()
  await waitVisible(a1.page, '응답이 주최자에게 반영됐어요.')
  await waitVisible(a1.page, '확정 가능한 시간 보기')
  const confirmStill = await a1.page.getByRole('button', { name: '확인' }).count()
  if (confirmStill > 0) {
    console.warn('warning: product confirm still visible with review CTA')
  }
  await shot(a1.page, '03-approve-review-transition')
  await a1.ctx.close()

  // 4–5 decline path
  const seed2 = await seedPendingRequest(organizer)
  const a2 = await openAttendee(browser, seed2.storage, seed2.requestId)
  await a2.page.getByRole('button', { name: '이 시간은 어려워요' }).click()
  await waitVisible(a2.page, '어렵다고 전달했어요.')
  await shot(a2.page, '04-decline-complete-no-review')
  await a2.page.getByRole('button', { name: '확인' }).click()
  await waitVisible(a2.page, '응답이 주최자에게 반영됐어요.')
  await waitVisible(a2.page, '새로 계산된 시간 보기')
  await shot(a2.page, '05-decline-review-transition')
  await a2.ctx.close()

  // 6. usertest approve complete (no review after confirm either — end flow)
  const seed3 = await seedPendingRequest(organizer)
  const a3 = await openAttendee(
    browser,
    seed3.storage,
    seed3.requestId,
    '&usertest=1',
  )
  await a3.page.getByRole('button', { name: '이 시간 사용 가능' }).click()
  await waitVisible(a3.page, '가능하다고 전달했어요.')
  await shot(a3.page, '06-usertest-approve-complete')
  await a3.page.getByRole('button', { name: '확인' }).click()
  await a3.page.waitForURL((url) => url.pathname === '/')
  await a3.ctx.close()

  await desktop.close()
  await browser.close()
  console.log('done →', OUT)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
