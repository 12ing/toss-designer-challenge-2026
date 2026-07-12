import { mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-p3-visual')

async function shot(page, name) {
  await page.waitForTimeout(300)
  await page.screenshot({
    path: path.join(OUT, `${name}.png`),
    fullPage: true,
  })
  console.log('saved', name)
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

  // 1. default 필수 4 · 선택 2 desktop
  await openSetup(page)
  await page
    .getByText('필수 4명 · 선택 2명')
    .filter({ visible: true })
    .first()
    .waitFor()
  await page.getByText('공유된 일정 조건').filter({ visible: true }).first().waitFor()
  await page.getByText('참석 구분').filter({ visible: true }).first().waitFor()
  await shot(page, '01-default-desktop')

  // 2. organizer row crop
  const organizer = page.getByLabel('김민지, PO, 주최자, 필수 참석 고정')
  await organizer.waitFor({ state: 'visible' })
  await organizer.screenshot({ path: path.join(OUT, '02-organizer-row.png') })
  console.log('saved', '02-organizer-row')

  // 3. required selected state (이지훈)
  const jihoon = page.getByRole('radiogroup', { name: '이지훈 참석 조건' })
  await jihoon.screenshot({ path: path.join(OUT, '03-required-selected.png') })
  console.log('saved', '03-required-selected')

  // 4. optional selected state (정유진)
  const yujin = page.getByRole('radiogroup', { name: '정유진 참석 조건' })
  await yujin.screenshot({ path: path.join(OUT, '04-optional-selected.png') })
  console.log('saved', '04-optional-selected')

  // 5. indicator motion video
  const videoCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  })
  const videoPage = await videoCtx.newPage()
  await openSetup(videoPage)
  const target = videoPage.getByRole('radiogroup', { name: '정유진 참석 조건' })
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
  const destVideo = path.join(OUT, '05-indicator-motion.webm')
  await rename(videoPath, destVideo)
  console.log('saved', '05-indicator-motion')

  // 6. privacy popover
  await openSetup(page)
  await page.getByRole('button', { name: '공유된 일정 조건 안내' }).click()
  await page
    .getByText('개인 일정의 제목과 사유는 공개되지 않아요.')
    .filter({ visible: true })
    .first()
    .waitFor()
  await shot(page, '06-privacy-popover')

  // 7. mobile default
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  })
  const m = await mobile.newPage()
  await openSetup(m)
  await m.getByText('필수 고정').filter({ visible: true }).first().waitFor()
  await m.getByText('PO · 주최자').filter({ visible: true }).first().waitFor()
  await shot(m, '07-mobile-default')
  await mobile.close()

  // 8. 200% text zoom
  await openSetup(page)
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2'
  })
  await page.waitForTimeout(400)
  await shot(page, '08-text-zoom-200')

  await desktop.close()
  await browser.close()
  console.log('done →', OUT)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
