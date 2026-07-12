import { mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-p5-correction')

async function shot(page, name, options = {}) {
  await page.waitForTimeout(300)
  await page.screenshot({
    path: path.join(OUT, `${name}.png`),
    fullPage: options.fullPage ?? true,
  })
  console.log('saved', name)
}

async function waitText(page, text) {
  await page
    .getByText(text, { exact: false })
    .filter({ visible: true })
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
}

async function saveVideo(context, page, name) {
  const video = page.video()
  await context.close()
  if (!video) return
  await rename(await video.path(), path.join(OUT, `${name}.webm`))
  console.log('saved', `${name}.webm`)
}

async function openLab(page) {
  await page.goto(`${BASE}/lab`)
  await waitText(page, '조건을 바꾸면 같은 기준으로 다시 계산해요')
}

async function forceNoOptionInLab(page) {
  // Make every required participant hard-busy across all candidate slots via UI:
  // set all to required, then if still not NO_OPTION inject fixture-like overrides
  // through evaluate on the page by clicking until status appears.
  await page.getByRole('button', { name: '모두 필수' }).click()
  await page.waitForTimeout(400)
  const status = await page
    .getByText('조건 변경 필요', { exact: false })
    .filter({ visible: true })
    .count()
  if (status > 0) return

  // Decline confirmation path repeatedly from coordination if needed
  await page.getByRole('button', { name: '확인 요청 필요' }).click()
  await waitText(page, '확인 필요')
  for (let i = 0; i < 8; i++) {
    const decline = page.getByRole('button', { name: '이 시간은 어려움' })
    if ((await decline.count()) === 0) break
    await decline.click()
    await page.waitForTimeout(350)
    if (
      (await page
        .getByText('조건 변경 필요', { exact: false })
        .filter({ visible: true })
        .count()) > 0
    ) {
      return
    }
  }
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()

  // 1. Landing desktop
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/`)
    await waitText(page, '핵심 흐름 시작')
    // Ensure no DecisionPreview
    const preview = await page.getByLabel('핵심 경험 미리보기').count()
    if (preview > 0) throw new Error('DecisionPreview still on landing')
    await shot(page, '01-landing-desktop')
    await ctx.close()
  }

  // 2–3. Landing mobile 390 / 320
  for (const [w, name] of [
    [390, '02-landing-mobile-390'],
    [320, '03-landing-mobile-320'],
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: 844 },
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/`)
    await waitText(page, '핵심 흐름 시작')
    await shot(page, name)
    await ctx.close()
  }

  // 4. Rule Lab NEED_CONFIRMATION desktop
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await openLab(page)
    await page.getByRole('button', { name: '확인 요청 필요' }).click()
    await waitText(page, '확인 필요')
    await page.getByRole('button', { name: '사용 가능' }).waitFor({
      state: 'visible',
      timeout: 10000,
    })
    await shot(page, '04-lab-need-confirmation')
    await ctx.close()
  }

  // 5. Rule Lab READY
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await openLab(page)
    await page.getByRole('button', { name: '바로 확정' }).click()
    await waitText(page, '바로 확정 가능')
    const sim = await page.getByRole('button', { name: '사용 가능' }).count()
    if (sim > 0) throw new Error('Simulation shown on READY')
    await shot(page, '05-lab-ready')
    await ctx.close()
  }

  // 6. Rule Lab NO_OPTION
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await openLab(page)
    await forceNoOptionInLab(page)
    await waitText(page, '조건 변경 필요')
    const sim = await page.getByRole('button', { name: '사용 가능' }).count()
    if (sim > 0) throw new Error('Simulation shown on NO_OPTION')
    await shot(page, '06-lab-no-option')
    await ctx.close()
  }

  // 7–8. Rule Lab mobile rules collapsed / expanded
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    const page = await ctx.newPage()
    await openLab(page)
    // Ensure collapsed: list hidden
    const list = page.locator('#rule-order-list')
    await page.waitForTimeout(200)
    const collapsedHidden = await list.evaluate(
      (el) => getComputedStyle(el).display === 'none',
    )
    if (!collapsedHidden) {
      const toggle = page.getByRole('button', { name: '기준 접기' })
      if (await toggle.count()) await toggle.click()
    }
    await shot(page, '07-lab-mobile-rules-collapsed')
    await page
      .getByRole('button', { name: '시간을 비교하는 기준 보기' })
      .click()
    await waitText(page, '필수 참석자의 고정 일정')
    await shot(page, '08-lab-mobile-rules-expanded')
    await ctx.close()
  }

  // 9. Response simulation focus crop
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await openLab(page)
    await page.getByRole('button', { name: '확인 요청 필요' }).click()
    await page.getByRole('button', { name: '사용 가능' }).waitFor({
      state: 'visible',
    })
    const box = page
      .locator('div')
      .filter({ hasText: '응답 가정하기' })
      .filter({ has: page.getByRole('button', { name: '사용 가능' }) })
      .first()
    await box.screenshot({ path: path.join(OUT, '09-response-simulation.png') })
    console.log('saved', '09-response-simulation')
    await ctx.close()
  }

  // 10. Restart core flow video
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/`)
    await page.evaluate(() => sessionStorage.clear())
    await page.goto(`${BASE}/`)
    await page.getByRole('button', { name: '핵심 흐름 시작' }).click()
    await waitText(page, '참석 조건을 확인해주세요')
    await page.getByRole('button', { name: '상황 선택' }).click()
    await page.getByRole('button', { name: '바로 확정되는 경우' }).click()
    await waitText(page, '참석 조건을 확인해주세요')
    await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
    await waitText(page, '바로 확정할 수 있어요')
    await page.getByRole('button', { name: '이 시간으로 확정' }).click()
    await waitText(page, '이 시간으로 회의를 만들까요')
    await page.getByRole('button', { name: '회의 만들기' }).click()
    await waitText(page, '회의 시간을 확정했어요')
    await page.getByRole('button', { name: '완료' }).click()
    await waitText(page, '핵심 흐름 완료')
    await page.getByRole('link', { name: '처음부터 다시 시작' }).click()
    await waitText(page, '핵심 흐름 시작')
    await page.getByRole('button', { name: '핵심 흐름 시작' }).click()
    await waitText(page, '참석 조건을 확인해주세요')
    if ((await page.getByText('바로 확정할 수 있어요').count()) > 0) {
      throw new Error('Previous complete/ready state leaked')
    }
    await page.waitForTimeout(800)
    await saveVideo(ctx, page, '10-restart-core-flow')
  }

  // 11. NO_OPTION → change conditions video
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/`)
    await page.evaluate(() => sessionStorage.clear())
    await page.goto(`${BASE}/?review=1&fixture=no-option`)
    await page.getByRole('button', { name: '핵심 흐름 시작' }).click()
    await waitText(page, '참석 조건을 확인해주세요')
    const url = page.url()
    if (!url.includes('fixture=no-option')) {
      await page.goto(
        url.includes('?')
          ? `${url}&fixture=no-option`
          : `${url}?review=1&fixture=no-option`,
      )
    }
    await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
    await waitText(page, '참석 조건 다시 보기')
    await page.waitForTimeout(600)
    await page.getByRole('button', { name: '참석 조건 다시 보기' }).click()
    await waitText(page, '참석 조건을 확인해주세요')
    await page.waitForTimeout(800)
    await saveVideo(ctx, page, '11-no-option-change-conditions')
  }

  await browser.close()
  console.log('done →', OUT)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
