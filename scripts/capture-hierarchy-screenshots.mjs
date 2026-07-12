import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-hierarchy')

async function shot(page, name) {
  await page.waitForTimeout(350)
  await page.screenshot({
    path: path.join(OUT, `${name}.png`),
    fullPage: true,
  })
  console.log('saved', name)
}

async function waitText(page, text) {
  await page
    .getByText(text, { exact: false })
    .filter({ visible: true })
    .first()
    .waitFor({ state: 'visible', timeout: 8000 })
  await page.waitForTimeout(400)
}

async function waitVisibleHeading(page, text) {
  await page
    .locator('h4')
    .filter({ hasText: text, visible: true })
    .first()
    .waitFor({ state: 'visible', timeout: 8000 })
  await page.waitForTimeout(300)
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
  })

  const page = await desktop.newPage()

  // 1. setup default
  await page.goto(`${BASE}/prototype?scenario=coordination`)
  await waitText(page, '참석 조건을 확인해주세요')
  await waitText(page, '필수 4명 · 선택 2명')
  await shot(page, '01-setup-default')

  // 2. segmented mid-transition — click then quick shot
  const group = page.getByRole('radiogroup', { name: '정유진 참석 조건' })
  await group.getByRole('radio', { name: '필수' }).click()
  await page.waitForTimeout(90)
  await shot(page, '02-segment-indicator-motion')
  await waitText(page, '필수 5명 · 선택 1명')

  // 3. organizer row — crop-friendly full page is fine
  await page.goto(`${BASE}/prototype?scenario=coordination`)
  await waitText(page, '김민지')
  await shot(page, '03-organizer-row')

  // 4. READY people panel
  await page.goto(`${BASE}/prototype?scenario=ready`)
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitText(page, '바로 확정할 수 있어요.')
  await waitVisibleHeading(page, '필수 참석자')
  await shot(page, '04-ready-people-panel')

  // 5. NEED_CONFIRMATION
  await page.goto(`${BASE}/prototype?scenario=coordination`)
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitText(page, '확인 한 번이면 필수 참석자 모두 가능해요.')
  await waitText(page, '확인이 필요한 사람')
  await waitVisibleHeading(page, '필수 참석자')
  await shot(page, '05-need-confirmation-people-panel')

  // 6. WAITING
  await page.getByRole('button', { name: '가능 여부 묻기' }).click()
  await page.getByRole('button', { name: '요청 보내기' }).click()
  await waitText(page, '응답을 기다리고 있어요.')
  await waitText(page, '응답 대기')
  await shot(page, '06-waiting-people-panel')

  // 7. READY_AFTER_CONFIRMATION
  await page.getByRole('button', { name: '참석자 화면 보기' }).click()
  await page.getByRole('button', { name: '이 시간 사용 가능' }).click()
  await page.getByRole('button', { name: '확인' }).click()
  await waitText(page, '이제 확정할 수 있어요.')
  await shot(page, '07-ready-after-confirmation-people-panel')

  // 8–9 mobile
  const m = await mobile.newPage()
  await m.goto(`${BASE}/prototype?scenario=coordination`)
  await m.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitText(m, '확인 한 번이면 필수 참석자 모두 가능해요.')
  await waitText(m, '확인 대상 · 이지훈')
  await shot(m, '08-mobile-need-confirmation-collapsed')

  await m.getByRole('button', { name: '6명 상황 보기' }).click()
  await m.getByRole('button', { name: '접기' }).waitFor({ state: 'visible' })
  await waitVisibleHeading(m, '필수 참석자')
  await shot(m, '09-mobile-people-expanded')

  await browser.close()
  console.log('done →', OUT)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
