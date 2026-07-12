import { mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-p6-prepatch')

async function shot(page, name, options = {}) {
  await page.waitForTimeout(350)
  await page.screenshot({
    path: path.join(OUT, `${name}.png`),
    fullPage: options.fullPage ?? false,
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

async function startCore(page) {
  await page.goto(`${BASE}/`)
  await page.evaluate(() => sessionStorage.clear())
  await page.goto(`${BASE}/`)
  await waitText(page, '핵심 흐름 시작')
  await page.getByRole('button', { name: '핵심 흐름 시작' }).click()
  await waitText(page, '참석 조건을 확인해주세요')
}

async function goToNeedConfirmation(page) {
  await startCore(page)
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitText(page, '확인 한 번이면')
}

async function goToWaiting(page) {
  await goToNeedConfirmation(page)
  await page.getByRole('button', { name: '확인 요청하기' }).click()
  await waitText(page, '확인 요청 보내기')
  await page.getByRole('button', { name: '확인 요청 보내기' }).click()
  await waitText(page, '응답을 기다리고 있어요')
  await waitText(page, '참석자 화면 보기')
}

async function goToNoOption(page) {
  await page.goto(`${BASE}/`)
  await page.evaluate(() => sessionStorage.clear())
  await page.goto(`${BASE}/?review=1&fixture=no-option`)
  await page.getByRole('button', { name: '핵심 흐름 시작' }).click()
  await waitText(page, '참석 조건을 확인해주세요')
  // Keep review query + fixture through analyzing
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
}

async function saveVideo(context, page, name) {
  const video = page.video()
  await context.close()
  if (!video) return
  const src = await video.path()
  await rename(src, path.join(OUT, `${name}.webm`))
  console.log('saved', `${name}.webm`)
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()

  // --- Landing desktop / mobile ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/`)
    await waitText(page, '핵심 흐름 시작')
    await shot(page, '09-landing-desktop')
    await ctx.close()
  }
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/`)
    await waitText(page, '핵심 흐름 시작')
    await shot(page, '10-landing-mobile')
    await ctx.close()
  }

  // --- Product header removed + DecisionSurface default ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await goToNeedConfirmation(page)
    const hasProductHeader = await page
      .getByRole('heading', { name: '회의 시간 잡기' })
      .count()
    if (hasProductHeader > 0) {
      throw new Error('Product header still visible')
    }
    await shot(page, '05-decision-surface-default')
    await shot(page, '14-product-header-removed')

    // Reason panel swap
    await page
      .getByRole('button', { name: /이 시간인 이유|왜 이 시간이 조율이 가장 적나요/ })
      .click()
    await waitText(page, '이 시간을 고른 이유')
    await shot(page, '06-reason-panel')
    await page.getByRole('button', { name: '참석 상황 보기' }).first().click()
    await waitText(page, '참석 상황')
    await shot(page, '07-people-panel-return')

    // 1440 no-scroll check
    const scroll = await page.evaluate(() => ({
      doc: document.documentElement.scrollHeight,
      win: window.innerHeight,
      scrolled: window.scrollY,
    }))
    await page.evaluate((info) => {
      const el = document.createElement('div')
      el.id = 'scroll-metric'
      el.textContent = `scrollHeight=${info.doc} innerHeight=${info.win}`
      el.style.cssText =
        'position:fixed;left:8px;bottom:8px;z-index:9999;background:#fff;border:1px solid #ccc;padding:6px 8px;font:12px monospace'
      document.body.appendChild(el)
    }, scroll)
    await shot(page, '15-1440-no-scroll')
    console.log('scroll metric', scroll)
    await ctx.close()
  }

  // --- WAITING desktop ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await goToWaiting(page)
    await shot(page, '03-waiting-review-panel-desktop')
    await ctx.close()
  }

  // --- WAITING mobile ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    const page = await ctx.newPage()
    await goToWaiting(page)
    await shot(page, '04-waiting-review-panel-mobile')
    await ctx.close()
  }

  // --- Mobile reason bottom sheet ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    const page = await ctx.newPage()
    await goToNeedConfirmation(page)
    await page
      .getByRole('button', { name: /이 시간인 이유|왜 이 시간이 조율이 가장 적나요/ })
      .click()
    await waitText(page, '이 시간을 고른 이유')
    await shot(page, '08-mobile-reason-sheet')
    await ctx.close()
  }

  // --- Privacy hover ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await startCore(page)
    const info = page.getByRole('button', { name: '일정 조건 안내' })
    await info.hover()
    await page.waitForTimeout(300)
    await waitText(page, '개인 일정의 제목과 사유는 공개되지 않아요.')
    await shot(page, '11-privacy-hover')
    await ctx.close()
  }

  // --- Privacy keyboard focus ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await startCore(page)
    const info = page.getByRole('button', { name: '일정 조건 안내' })
    await info.focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(200)
    await waitText(page, '개인 일정의 제목과 사유는 공개되지 않아요.')
    await shot(page, '12-privacy-keyboard')
    await ctx.close()
  }

  // --- Privacy touch toggle ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    })
    const page = await ctx.newPage()
    await startCore(page)
    const info = page.getByRole('button', { name: '일정 조건 안내' })
    await info.scrollIntoViewIfNeeded()
    await info.click()
    await waitText(page, '개인 일정의 제목과 사유는 공개되지 않아요.')
    await shot(page, '13-privacy-touch')
    await ctx.close()
  }

  // --- Video 1: NO_OPTION → change conditions ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
    })
    const page = await ctx.newPage()
    await goToNoOption(page)
    await page.waitForTimeout(800)
    await page.getByRole('button', { name: '참석 조건 다시 보기' }).click()
    await waitText(page, '참석 조건을 확인해주세요')
    await page.waitForTimeout(1000)
    await saveVideo(ctx, page, '01-no-option-change-conditions')
  }

  // --- Video 2: complete → home → restart fresh ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
    })
    const page = await ctx.newPage()
    await goToNeedConfirmation(page)
    // Jump via ready branch for faster completion path
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
    await page.waitForTimeout(600)
    await page.getByRole('button', { name: '핵심 흐름 시작' }).click()
    await waitText(page, '참석 조건을 확인해주세요')
    const waiting = await page.getByText('응답을 기다리고 있어요').count()
    const ready = await page.getByText('바로 확정할 수 있어요').count()
    if (waiting > 0 || ready > 0) {
      throw new Error('Previous session state leaked into new core flow')
    }
    await page.waitForTimeout(1000)
    await saveVideo(ctx, page, '02-restart-core-flow')
  }

  await browser.close()
  console.log('done →', OUT)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
