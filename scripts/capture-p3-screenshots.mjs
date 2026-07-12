import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-p3')

async function shot(page, name) {
  await page.waitForTimeout(350)
  await page.screenshot({
    path: path.join(OUT, `${name}.png`),
    fullPage: true,
  })
  console.log('saved', name)
}

async function openSetup(page, scenario = 'coordination') {
  await page.goto(`${BASE}/prototype?scenario=${scenario}`)
  await page.getByRole('heading', { name: '참석 조건을 확인해주세요' }).waitFor()
  await page.waitForTimeout(300)
}

async function setAttendance(page, name, type) {
  const group = page.getByRole('radiogroup', { name: `${name} 참석 조건` })
  await group.getByRole('radio', { name: type }).click()
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

  // 1. default 필수 4 · 선택 2
  await openSetup(page)
  await page.getByText('필수 4명 · 선택 2명').waitFor()
  await shot(page, '01-default-summary')

  // 2. all required
  await setAttendance(page, '정유진', '필수')
  await setAttendance(page, '한현우', '필수')
  await page.getByText('필수 6명 · 선택 없음').waitFor()
  await shot(page, '02-all-required')

  // 3. organizer only required
  await openSetup(page)
  await setAttendance(page, '이지훈', '선택')
  await setAttendance(page, '박서연', '선택')
  await setAttendance(page, '최도윤', '선택')
  await page.getByText('필수 1명 · 선택 5명').waitFor()
  await shot(page, '03-organizer-only-required')

  // 4. segmented focus
  await openSetup(page)
  const group = page.getByRole('radiogroup', { name: '이지훈 참석 조건' })
  await group.getByRole('radio', { name: '필수' }).focus()
  await page.waitForTimeout(200)
  await shot(page, '04-segment-focus')

  // 5. privacy popover
  await page.getByRole('button', { name: '공유되는 일정 정보' }).click()
  await page.getByText('개인 일정의 제목과 사유는 공개되지 않아요.').waitFor()
  await shot(page, '05-privacy-popover')

  // 7. immediately before find time (default setup still visible, then analyzing)
  await openSetup(page)
  await shot(page, '07-before-find-time')
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await page.getByText('필수 참석자가 모두 가능한 시간을 찾고 있어요.').waitFor()
  await page.waitForTimeout(200)
  // still capture analyzing as transition companion — user asked 시간 찾기 직전 which is 07

  // 6. mobile
  const m = await mobile.newPage()
  await openSetup(m)
  await shot(m, '06-mobile-setup')

  await browser.close()
  console.log('done →', OUT)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
