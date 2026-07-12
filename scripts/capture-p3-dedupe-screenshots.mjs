import { mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-p3-dedupe')

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
    .waitFor({ state: 'visible', timeout: 8000 })
}

async function openSetup(page, scenario = 'coordination') {
  await page.goto(`${BASE}/prototype?scenario=${scenario}`)
  await page
    .getByRole('heading', { name: '참석 조건을 확인해주세요' })
    .waitFor({ state: 'visible' })
  await page.waitForTimeout(250)
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()

  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  const page = await desktop.newPage()

  // 1. desktop setup
  await openSetup(page)
  await waitVisible(page, '필수 4명 · 선택 2명')
  await waitVisible(page, '공유된 일정 조건')
  await waitVisible(page, '참석 구분')
  await shot(page, '01-setup-desktop')

  // 2. organizer crop
  const organizer = page.getByLabel('김민지, PO, 주최자, 필수 참석 고정')
  await organizer.waitFor({ state: 'visible' })
  await organizer.screenshot({ path: path.join(OUT, '02-organizer-row.png') })
  console.log('saved', '02-organizer-row')

  // 3. required selected
  await page
    .getByRole('radiogroup', { name: '이지훈 참석 조건' })
    .filter({ visible: true })
    .first()
    .screenshot({ path: path.join(OUT, '03-required-selected.png') })
  console.log('saved', '03-required-selected')

  // 4. optional selected
  await page
    .getByRole('radiogroup', { name: '정유진 참석 조건' })
    .filter({ visible: true })
    .first()
    .screenshot({ path: path.join(OUT, '04-optional-selected.png') })
  console.log('saved', '04-optional-selected')

  // 5. NEED_CONFIRMATION desktop
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(page, '확인 한 번이면 필수 참석자 모두 가능해요.')
  await waitVisible(page, '확인 대상 · 이지훈')
  await waitVisible(page, '확인 필요')
  await page.waitForTimeout(400)
  await shot(page, '05-need-confirmation-desktop')

  // 6. WAITING desktop — go through request preview → send
  await page.getByRole('button', { name: '가능 여부 묻기' }).click()
  await page.getByRole('button', { name: '요청 보내기' }).click()
  await waitVisible(page, '응답을 기다리고 있어요.')
  await waitVisible(page, '응답 대기')
  await page.waitForTimeout(300)
  await shot(page, '06-waiting-desktop')

  // 7. READY_AFTER — attendee approve path
  await page.getByRole('button', { name: '참석자 화면 보기' }).click()
  await page.getByRole('button', { name: '이 시간 사용 가능' }).click()
  await page.getByRole('button', { name: '확인' }).waitFor({ state: 'visible', timeout: 10000 })
  await page.getByRole('button', { name: '확인' }).click()
  await waitVisible(page, '이제 확정할 수 있어요.')
  await page.waitForTimeout(400)
  await shot(page, '07-ready-after-confirmation-desktop')

  // 8–9. mobile NEED_CONFIRMATION collapsed / expanded
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  })
  const m = await mobile.newPage()
  await openSetup(m)
  await m.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(m, '확인 한 번이면 필수 참석자 모두 가능해요.')
  await waitVisible(m, '확인 대상 · 이지훈')
  await waitVisible(m, '참석 상황 보기')
  await shot(m, '08-mobile-need-confirmation-collapsed')

  await m.getByRole('button', { name: '참석 상황 보기' }).click()
  await m.getByRole('button', { name: '접기' }).waitFor({ state: 'visible' })
  await waitVisible(m, '필수 참석자')
  await waitVisible(m, '확인 필요')
  await shot(m, '09-mobile-people-expanded')
  await mobile.close()

  // 10. indicator motion video
  const videoCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  })
  const videoPage = await videoCtx.newPage()
  await openSetup(videoPage)
  const target = videoPage
    .getByRole('radiogroup', { name: '정유진 참석 조건' })
    .filter({ visible: true })
    .first()
  await target.scrollIntoViewIfNeeded()
  await videoPage.waitForTimeout(400)
  await target.getByRole('radio', { name: '필수' }).click()
  await videoPage.waitForTimeout(500)
  await target.getByRole('radio', { name: '선택' }).click()
  await videoPage.waitForTimeout(500)
  await target.getByRole('radio', { name: '필수' }).click()
  await videoPage.waitForTimeout(500)
  const videoPath = await videoPage.video().path()
  await videoCtx.close()
  await rename(videoPath, path.join(OUT, '10-indicator-motion.webm'))
  console.log('saved', '10-indicator-motion')

  await desktop.close()
  await browser.close()
  console.log('done →', OUT)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
