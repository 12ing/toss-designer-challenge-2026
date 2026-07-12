import { mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-interaction')

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

async function clear(page) {
  await page.goto(`${BASE}/`)
  await page.evaluate(() => sessionStorage.clear())
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await desktop.newPage()

  // 1. setup desktop
  await clear(page)
  await page.goto(`${BASE}/prototype?scenario=coordination`)
  await waitVisible(page, '참석 조건을 확인해주세요')
  await waitVisible(page, '일정 조건')
  await shot(page, '01-setup-desktop')

  // 4. segmented crop
  await page
    .getByRole('radiogroup', { name: '이지훈 참석 조건' })
    .filter({ visible: true })
    .first()
    .screenshot({ path: path.join(OUT, '04-segmented-control.png') })
  console.log('saved', '04-segmented-control')

  // 2. setup mobile
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  const m = await mobile.newPage()
  await clear(m)
  await m.goto(`${BASE}/prototype?scenario=coordination`)
  await waitVisible(m, '참석 조건을 확인해주세요')
  await shot(m, '02-setup-mobile')

  // 3. hit area video
  const videoCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  })
  const v = await videoCtx.newPage()
  await clear(v)
  await v.goto(`${BASE}/prototype?scenario=coordination`)
  await waitVisible(v, '참석 조건을 확인해주세요')
  const group = v
    .getByRole('radiogroup', { name: '정유진 참석 조건' })
    .filter({ visible: true })
    .first()
  await group.scrollIntoViewIfNeeded()
  await v.waitForTimeout(300)
  // click padding area of 선택 / 필수 by box
  const box = await group.boundingBox()
  if (box) {
    await v.mouse.click(box.x + box.width * 0.75, box.y + box.height * 0.5)
    await v.waitForTimeout(400)
    await v.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.5)
    await v.waitForTimeout(400)
    await v.mouse.click(box.x + box.width * 0.75, box.y + box.height * 0.5)
    await v.waitForTimeout(400)
  }
  const videoPath = await v.video().path()
  await videoCtx.close()
  await rename(videoPath, path.join(OUT, '03-segment-hit-area.webm'))
  console.log('saved', '03-segment-hit-area')

  // 5. READY people
  await clear(page)
  await page.goto(`${BASE}/prototype?scenario=ready`)
  await waitVisible(page, '참석 조건을 확인해주세요')
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(page, '바로 확정할 수 있어요.')
  await shot(page, '05-ready-people')

  // 6. NEED_CONFIRMATION
  await clear(page)
  await page.goto(`${BASE}/prototype?scenario=coordination`)
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(page, '확인 한 번이면')
  await waitVisible(page, '확인 대상 · 이지훈')
  await shot(page, '06-need-confirmation-people')

  // 7. WAITING
  await page.getByRole('button', { name: '가능 여부 묻기' }).click()
  await page.getByRole('button', { name: '요청 보내기' }).click()
  await waitVisible(page, '응답을 기다리고 있어요.')
  await waitVisible(page, '응답 대기')
  await shot(page, '07-waiting-people')

  // 8. attendee mobile
  const storage = await page.evaluate(() =>
    sessionStorage.getItem('toss-meeting-decision-session-v1'),
  )
  const requestId = await page.evaluate(() => {
    const raw = sessionStorage.getItem('toss-meeting-decision-session-v1')
    return raw ? JSON.parse(raw).activeRequest?.id : null
  })
  await m.goto(`${BASE}/`)
  await m.evaluate((value) => {
    sessionStorage.setItem('toss-meeting-decision-session-v1', value)
  }, storage)
  await m.goto(`${BASE}/prototype/respond/${requestId}?scenario=coordination`)
  await waitVisible(m, '이 시간, 괜찮으세요?')
  await waitVisible(m, '김민지 님이 회의 참석 가능 여부를 물었어요.')
  await shot(m, '08-attendee-request')

  // 9–10 NO_OPTION
  await clear(page)
  await page.goto(`${BASE}/prototype?scenario=coordination&fixture=no-option`)
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(page, '모두가 가능한 1시간을 찾기 어려워요')
  await shot(page, '09-no-option-desktop')

  await clear(m)
  await m.goto(`${BASE}/prototype?scenario=coordination&fixture=no-option`)
  await m.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(m, '모두가 가능한 1시간을 찾기 어려워요')
  await shot(m, '10-no-option-mobile')

  await mobile.close()
  await desktop.close()
  await browser.close()
  console.log('done →', OUT)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
