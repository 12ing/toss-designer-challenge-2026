import { mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-interaction-v2')

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
    .waitFor({ state: 'visible', timeout: 15000 })
}

async function clear(page) {
  await page.goto(`${BASE}/`)
  await page.evaluate(() => sessionStorage.clear())
}

async function openSetup(page, query = 'review=1') {
  await clear(page)
  await page.goto(`${BASE}/`)
  await page.getByRole('button', { name: '핵심 플로우 시작' }).click()
  await waitVisible(page, '참석 조건을 확인해주세요')
  if (!page.url().includes('review=1') && query.includes('review')) {
    const url = new URL(page.url())
    url.searchParams.set('review', '1')
    await page.goto(url.toString())
    await waitVisible(page, '참석 조건을 확인해주세요')
  }
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()

  // 1. selected indicator click: 필수 stays 필수 (no toggle)
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
    })
    const page = await ctx.newPage()
    await openSetup(page)
    const group = page
      .getByRole('radiogroup', { name: '이지훈 참석 구분' })
      .filter({ visible: true })
      .first()
    await group.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    const box = await group.boundingBox()
    // click center of selected 필수 segment (left half)
    await page.mouse.click(box.x + box.width * 0.25, box.y + box.height / 2)
    await page.waitForTimeout(500)
    await page.mouse.click(box.x + box.width * 0.25, box.y + box.height / 2)
    await page.waitForTimeout(500)
    const checked = await group
      .getByRole('radio', { name: '필수' })
      .getAttribute('aria-checked')
    if (checked !== 'true') throw new Error('required toggled away on re-click')
    const video = await page.video()
    await page.close()
    await ctx.close()
    if (video) {
      await rename(
        await video.path(),
        path.join(OUT, '01-selected-required-no-toggle.webm'),
      )
      console.log('saved 01-selected-required-no-toggle.webm')
    }
  }

  // 2. selected indicator click: 선택 stays 선택
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
    })
    const page = await ctx.newPage()
    await openSetup(page)
    const group = page
      .getByRole('radiogroup', { name: '정유진 참석 구분' })
      .filter({ visible: true })
      .first()
    await group.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    const box = await group.boundingBox()
    // already optional — click right half twice
    await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2)
    await page.waitForTimeout(500)
    await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2)
    await page.waitForTimeout(500)
    const checked = await group
      .getByRole('radio', { name: '선택' })
      .getAttribute('aria-checked')
    if (checked !== 'true') throw new Error('optional toggled away on re-click')
    const video = await page.video()
    await page.close()
    await ctx.close()
    if (video) {
      await rename(
        await video.path(),
        path.join(OUT, '02-selected-optional-no-toggle.webm'),
      )
      console.log('saved 02-selected-optional-no-toggle.webm')
    }
  }

  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await desktop.newPage()
  await openSetup(page)

  // 3. mouse click — no outer focus ring
  const jihoon = page
    .getByRole('radiogroup', { name: '이지훈 참석 구분' })
    .filter({ visible: true })
    .first()
  await jihoon.getByRole('radio', { name: '선택' }).click()
  await page.waitForTimeout(200)
  await jihoon.screenshot({ path: path.join(OUT, '03-mouse-click-no-ring.png') })
  console.log('saved 03-mouse-click-no-ring')

  // 4. keyboard focus-visible
  await jihoon.getByRole('radio', { name: '선택' }).focus()
  await page.keyboard.press('Tab')
  await page.keyboard.down('Shift')
  await page.keyboard.press('Tab')
  await page.keyboard.up('Shift')
  // Force focus-visible by keyboard navigation onto the control
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(200)
  await jihoon.screenshot({
    path: path.join(OUT, '04-keyboard-focus-visible.png'),
  })
  console.log('saved 04-keyboard-focus-visible')

  // blur before full-page setup shot so mouse path has no focus ring
  await page.evaluate(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement) active.blur()
  })
  await page.waitForTimeout(150)

  // 10. setup without product review copy
  await shot(page, '10-setup-no-review-copy')
  const hasReviewCopy = await page
    .getByText('이번 플로우에서는 주최자가 직접 참석하는 회의를 가정했어요.')
    .isVisible()
    .catch(() => false)
  if (hasReviewCopy) throw new Error('review copy still in product UI')

  // 5. READY people list
  await clear(page)
  await page.goto(`${BASE}/prototype?scenario=ready&review=1`)
  await waitVisible(page, '참석 조건을 확인해주세요')
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(page, '바로 확정')
  await shot(page, '05-ready-people')

  // 6. NEED_CONFIRMATION
  await clear(page)
  await page.goto(`${BASE}/`)
  await page.getByRole('button', { name: '핵심 플로우 시작' }).click()
  await waitVisible(page, '참석 조건을 확인해주세요')
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(page, '확인 한 번이면')
  await shot(page, '06-need-confirmation-people')

  // 7. WAITING
  await page.getByRole('button', { name: '가능 여부 묻기' }).click()
  await page.getByRole('button', { name: '요청 보내기' }).click()
  await waitVisible(page, '응답을 기다리고')
  await shot(page, '07-waiting-people')

  // 8. NO_OPTION desktop
  await clear(page)
  await page.goto(`${BASE}/prototype?scenario=coordination&review=1&fixture=no-option`)
  await waitVisible(page, '참석 조건을 확인해주세요')
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(page, '필수 참석자가 모두 가능한 1시간')
  await shot(page, '08-no-option-desktop')

  // 9. NO_OPTION mobile
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  const m = await mobile.newPage()
  await clear(m)
  await m.goto(`${BASE}/prototype?scenario=coordination&review=1&fixture=no-option`)
  await waitVisible(m, '참석 조건을 확인해주세요')
  await m.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(m, '필수 참석자가 모두 가능한 1시간')
  await shot(m, '09-no-option-mobile')

  await browser.close()
  console.log('done →', OUT)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
