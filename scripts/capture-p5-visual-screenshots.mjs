import { mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-p5-visual')

async function shot(page, name, options = {}) {
  await page.waitForTimeout(options.pause ?? 400)
  await page.screenshot({
    path: path.join(OUT, `${name}.png`),
    fullPage: options.fullPage ?? true,
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

async function pause(page, ms) {
  await page.waitForTimeout(ms)
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()

  // 1. landing desktop
  const d1440 = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const d = await d1440.newPage()
  await clear(d)
  await d.goto(`${BASE}/`)
  await waitVisible(d, '핵심 흐름 시작')
  await waitVisible(d, '직접 비교하지 않아도')
  await shot(d, '01-review-landing-desktop')

  // 5. decision preview desktop crop
  const preview = d.getByLabel('핵심 경험 미리보기')
  await preview.screenshot({
    path: path.join(OUT, '05-decision-preview-desktop.png'),
  })
  console.log('saved 05-decision-preview-desktop')

  // 2. landing mobile
  const m390 = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  const m = await m390.newPage()
  await clear(m)
  await m.goto(`${BASE}/`)
  await waitVisible(m, '핵심 흐름 시작')
  await shot(m, '02-review-landing-mobile')

  // 6. preview mobile
  await m.getByLabel('핵심 경험 미리보기').screenshot({
    path: path.join(OUT, '06-decision-preview-mobile.png'),
  })
  console.log('saved 06-decision-preview-mobile')

  // 3. 200% — CSS viewport ~720 (browser zoom equivalent)
  const d720 = await browser.newContext({
    viewport: { width: 720, height: 900 },
  })
  const z = await d720.newPage()
  await clear(z)
  await z.goto(`${BASE}/`)
  await waitVisible(z, '핵심 흐름 시작')
  await shot(z, '03-review-landing-200pct')

  // 4. 320 CSS px
  const d320 = await browser.newContext({
    viewport: { width: 320, height: 720 },
  })
  const narrow = await d320.newPage()
  await clear(narrow)
  await narrow.goto(`${BASE}/`)
  await waitVisible(narrow, '핵심 흐름 시작')
  await shot(narrow, '04-review-landing-320')

  // 7–10 Rule Lab widths
  for (const [w, name] of [
    [1440, '07-rule-lab-1440'],
    [1280, '08-rule-lab-1280'],
    [1024, '09-rule-lab-1024'],
    [390, '10-rule-lab-mobile'],
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: w < 800 ? 844 : 900 },
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/lab`)
    await waitVisible(page, '결정 규칙 실험')
    await shot(page, name)
    await ctx.close()
  }

  // 11. NO_OPTION lab
  await d.goto(`${BASE}/lab`)
  await waitVisible(d, '결정 규칙 실험')
  await d.getByRole('button', { name: '확인 요청 필요' }).click()
  for (let i = 0; i < 4; i += 1) {
    if (await d.getByText('조건 변경 필요').isVisible().catch(() => false)) break
    const decline = d.getByRole('button', { name: '어려움으로 응답' })
    if (await decline.isVisible().catch(() => false)) {
      await decline.click()
      await pause(d, 500)
    } else break
  }
  await waitVisible(d, '필수 참석자가 모두 가능한 1시간')
  await shot(d, '11-no-option-lab')

  // 12. Review Completion
  await clear(d)
  await d.goto(`${BASE}/`)
  await d.getByRole('button', { name: '핵심 흐름 시작' }).click()
  await waitVisible(d, '참석 조건을 확인해주세요')
  await d.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(d, '확인 한 번이면')
  await d.getByRole('button', { name: '확인 요청하기' }).click()
  await d.getByRole('button', { name: '확인 요청 보내기' }).click()
  await waitVisible(d, '다음 장면')
  const seed = await d.evaluate(() => {
    const raw = sessionStorage.getItem('toss-meeting-decision-session-v1')
    const session = raw ? JSON.parse(raw) : null
    return {
      storage: raw,
      sessionId: session?.id,
      requestId: session?.activeRequest?.id,
    }
  })
  await d.goto(
    `${BASE}/prototype/session/${seed.sessionId}/respond/${seed.requestId}?review=1`,
  )
  await waitVisible(d, '이 시간, 괜찮으세요?')
  await d.getByRole('button', { name: '이 시간 사용 가능' }).click()
  await waitVisible(d, '확인')
  await d.getByRole('button', { name: '확인' }).click()
  await waitVisible(d, '주최자 결과 보기')
  await d.getByRole('button', { name: '주최자 결과 보기' }).click()
  await waitVisible(d, '이 시간으로 확정')
  await d.getByRole('button', { name: '이 시간으로 확정' }).click()
  await waitVisible(d, '회의 만들기')
  await d.getByRole('button', { name: '회의 만들기' }).click()
  await waitVisible(d, '완료')
  await d.getByRole('button', { name: '완료' }).click()
  await waitVisible(d, '회의 시간을 확정했어요')
  await shot(d, '12-review-completion')

  // 13. status UI comparison
  await d.setContent(`<!doctype html><html><body style="margin:0;font-family:system-ui;background:#eef0f3;padding:32px">
    <div id="root"></div>
  </body></html>`)
  // Render via app route instead — use product need-confirmation + waiting crops
  await clear(d)
  await d.goto(`${BASE}/`)
  await d.getByRole('button', { name: '핵심 흐름 시작' }).click()
  await waitVisible(d, '참석 조건')
  await d.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(d, '확인 필요')
  // Build a simple status strip page using evaluate inject
  await d.evaluate(() => {
    const wrap = document.createElement('div')
    wrap.id = 'status-compare'
    wrap.style.cssText =
      'position:fixed;inset:0;z-index:9999;background:#eef0f3;display:flex;align-items:center;justify-content:center;padding:40px'
    wrap.innerHTML = `
      <div style="background:#fff;border-radius:24px;padding:32px;min-width:280px;box-shadow:0 12px 32px rgba(0,27,55,.08)">
        <p style="margin:0 0 16px;font-size:13px;color:#8b95a1">상태 UI 공통</p>
        <div style="display:flex;flex-direction:column;gap:14px;font-size:13px;font-weight:600">
          <span style="display:inline-flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:99px;background:#18a86b"></span>가능</span>
          <span style="display:inline-flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:99px;background:#3b6ff5"></span>확인 필요</span>
          <span style="display:inline-flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:99px;background:#c2a056"></span>응답 대기</span>
          <span style="display:inline-flex;align-items:center;gap:6px;color:#8b95a1"><span style="width:6px;height:6px;border-radius:99px;background:#8b95a1"></span>참석 어려움</span>
        </div>
      </div>`
    document.body.appendChild(wrap)
  })
  await shot(d, '13-status-ui-common', { fullPage: false })

  // 14. Core flow video 15–25s with holds
  const flowCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  })
  const flow = await flowCtx.newPage()
  await clear(flow)
  await flow.goto(`${BASE}/`)
  await waitVisible(flow, '핵심 흐름 시작')
  await pause(flow, 1200)
  await flow.getByRole('button', { name: '핵심 흐름 시작' }).click()
  await waitVisible(flow, '참석 조건을 확인해주세요')
  await pause(flow, 1400)
  await flow.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(flow, '확인 한 번이면')
  await pause(flow, 1500)
  await flow.getByRole('button', { name: '확인 요청하기' }).click()
  await waitVisible(flow, '확인 요청 보내기')
  await pause(flow, 1200)
  await flow.getByRole('button', { name: '확인 요청 보내기' }).click()
  await waitVisible(flow, '다음 장면')
  await pause(flow, 1400)
  const fseed = await flow.evaluate(() => {
    const raw = sessionStorage.getItem('toss-meeting-decision-session-v1')
    const session = raw ? JSON.parse(raw) : null
    return {
      sessionId: session?.id,
      requestId: session?.activeRequest?.id,
    }
  })
  await flow.goto(
    `${BASE}/prototype/session/${fseed.sessionId}/respond/${fseed.requestId}?review=1`,
  )
  await waitVisible(flow, '이 시간, 괜찮으세요?')
  await pause(flow, 1400)
  await flow.getByRole('button', { name: '이 시간 사용 가능' }).click()
  await waitVisible(flow, '확인')
  await pause(flow, 1000)
  await flow.getByRole('button', { name: '확인' }).click()
  await waitVisible(flow, '주최자 결과 보기')
  await pause(flow, 1200)
  await flow.getByRole('button', { name: '주최자 결과 보기' }).click()
  await waitVisible(flow, '이 시간으로 확정')
  await pause(flow, 1400)
  await flow.getByRole('button', { name: '이 시간으로 확정' }).click()
  await waitVisible(flow, '회의 만들기')
  await pause(flow, 1000)
  await flow.getByRole('button', { name: '회의 만들기' }).click()
  await waitVisible(flow, '완료')
  await pause(flow, 1000)
  await flow.getByRole('button', { name: '완료' }).click()
  await waitVisible(flow, '회의 시간을 확정했어요')
  await pause(flow, 1600)
  const v1 = await flow.video()
  await flow.close()
  await flowCtx.close()
  if (v1) {
    await rename(await v1.path(), path.join(OUT, '14-core-flow.webm'))
    console.log('saved 14-core-flow.webm')
  }

  // 15. Rule Lab video 8–12s
  const labCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  })
  const lab = await labCtx.newPage()
  await lab.goto(`${BASE}/lab`)
  await waitVisible(lab, '결정 규칙 실험')
  await pause(lab, 1500)
  await lab.getByRole('button', { name: '바로 확정' }).click()
  await waitVisible(lab, '바로 확정 가능')
  await pause(lab, 1600)
  await lab.getByRole('button', { name: '이 조건으로 제품 흐름 보기' }).click()
  await waitVisible(lab, '참석 조건을 확인해주세요')
  await pause(lab, 1500)
  const v2 = await lab.video()
  await lab.close()
  await labCtx.close()
  if (v2) {
    await rename(await v2.path(), path.join(OUT, '15-rule-lab-flow.webm'))
    console.log('saved 15-rule-lab-flow.webm')
  }

  await browser.close()
  console.log('done →', OUT)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
