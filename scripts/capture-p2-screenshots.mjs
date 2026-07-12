import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-p2')

async function shot(page, name) {
  await page.waitForTimeout(400)
  await page.screenshot({
    path: path.join(OUT, `${name}.png`),
    fullPage: true,
  })
  console.log('saved', name)
}

async function waitText(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor({
    state: 'visible',
    timeout: 8000,
  })
  await page.waitForTimeout(450)
}

async function goToReady(page) {
  await page.goto(`${BASE}/prototype?scenario=ready`)
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitText(page, '바로 확정할 수 있어요.')
}

async function goToCoordinationResult(page) {
  await page.goto(`${BASE}/prototype?scenario=coordination`)
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitText(page, '확인 한 번이면 필수 참석자 모두 가능해요.')
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

  // 1. READY desktop
  await goToReady(page)
  await shot(page, '01-ready-desktop')

  // 2. READY reason expanded
  await page.getByRole('button', { name: '이 시간인 이유' }).click()
  await waitText(page, '필수 참석자')
  await shot(page, '02-ready-reason-expanded')

  // 3. NEED_CONFIRMATION desktop
  await goToCoordinationResult(page)
  await shot(page, '03-need-confirmation-desktop')

  // 4. WAITING desktop
  await page.getByRole('button', { name: '가능 여부 묻기' }).click()
  await page.getByRole('button', { name: '요청 보내기' }).click()
  await waitText(page, '응답을 기다리고 있어요.')
  await shot(page, '04-waiting-desktop')

  // 5. READY_AFTER_CONFIRMATION
  await page.getByRole('button', { name: '참석자 화면 보기' }).click()
  await page.getByRole('button', { name: '이 시간 사용 가능' }).click()
  await page.getByRole('button', { name: '확인' }).click()
  await waitText(page, '이제 확정할 수 있어요.')
  await shot(page, '05-ready-after-confirmation-desktop')

  // 6. NEXT_ALTERNATIVE
  await page.goto(`${BASE}/prototype?scenario=rejected`)
  await waitText(page, '다음으로 조율이 적은 시간을 찾았어요.')
  await shot(page, '06-next-alternative-desktop')

  // 7. NO_OPTION
  await page.goto(`${BASE}/prototype?scenario=coordination&fixture=no-option`)
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitText(page, '모두가 가능한 1시간을 찾기 어려워요')
  await shot(page, '07-no-option-desktop')

  // 8–10 mobile
  const m = await mobile.newPage()
  await goToReady(m)
  await shot(m, '08-ready-mobile')

  await goToCoordinationResult(m)
  await shot(m, '09-need-confirmation-mobile')

  await m.getByRole('button', { name: '6명 상황 보기' }).click()
  await m.getByRole('button', { name: '접기' }).waitFor({ state: 'visible' })
  await m.waitForTimeout(300)
  await shot(m, '10-mobile-people-expanded')

  await browser.close()
  console.log('done →', OUT)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
