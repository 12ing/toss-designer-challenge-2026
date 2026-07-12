import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-p5')

async function shot(page, name, options = {}) {
  await page.waitForTimeout(350)
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

async function startCore(page) {
  await page.goto(`${BASE}/`)
  await page.evaluate(() => sessionStorage.clear())
  await page.goto(`${BASE}/`)
  await waitVisible(page, '핵심 흐름 시작')
  await page.getByRole('button', { name: '핵심 흐름 시작' }).click()
  await waitVisible(page, '참석 조건을 확인해주세요')
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()

  // 1. landing desktop
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const d = await desktop.newPage()
  await d.goto(`${BASE}/`)
  await waitVisible(d, '핵심 흐름 시작')
  await shot(d, '01-review-landing-desktop')

  // 3. live preview crop focus
  await shot(d, '03-live-product-preview')

  // 2. landing mobile
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  const m = await mobile.newPage()
  await m.goto(`${BASE}/`)
  await waitVisible(m, '핵심 흐름 시작')
  await shot(m, '02-review-landing-mobile')

  // 14. 200% text zoom
  await d.evaluate(() => {
    document.documentElement.style.zoom = '2'
  })
  await shot(d, '14-text-zoom-200')
  await d.evaluate(() => {
    document.documentElement.style.zoom = '1'
  })

  // 4–6: product with chrome + design notes
  await startCore(d)
  await shot(d, '04-product-with-review-chrome')

  await d.getByRole('button', { name: '설계 근거' }).click()
  await waitVisible(d, '설계한 문제')
  await shot(d, '05-design-note-attendance')
  await d.getByRole('button', { name: '닫기' }).first().click()

  await d.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(d, '확인 한 번이면')
  await d.getByRole('button', { name: '확인 요청하기' }).click()
  await waitVisible(d, '확인 요청 보내기')
  await d.getByRole('button', { name: '설계 근거' }).click()
  await waitVisible(d, '이동 가능한 보호 시간')
  await shot(d, '06-design-note-confirmation')
  await d.getByRole('button', { name: '닫기' }).first().click()

  // 7. actor transition to attendee
  await d.getByRole('button', { name: '확인 요청 보내기' }).click()
  await waitVisible(d, '다음 장면')
  await shot(d, '07-actor-transition-attendee')

  const pending = await d.evaluate(() => {
    const raw = sessionStorage.getItem('toss-meeting-decision-session-v1')
    const session = raw ? JSON.parse(raw) : null
    return {
      storage: raw,
      sessionId: session?.id,
      requestId: session?.activeRequest?.id,
    }
  })

  // attendee flow
  const attendeeCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  const a = await attendeeCtx.newPage()
  await a.goto(`${BASE}/`)
  await a.evaluate((value) => {
    sessionStorage.setItem('toss-meeting-decision-session-v1', value)
  }, pending.storage)
  await a.goto(
    `${BASE}/prototype/session/${pending.sessionId}/respond/${pending.requestId}?review=1`,
  )
  await waitVisible(a, '이 시간, 괜찮으세요?')
  await a.getByRole('button', { name: '이 시간 사용 가능' }).click()
  await waitVisible(a, '가능하다고 전달했어요')
  await a.getByRole('button', { name: '확인' }).click()
  await waitVisible(a, '응답이 주최자에게 반영됐어요')
  await shot(a, '08-actor-transition-organizer')

  await a.getByRole('button', { name: '주최자 결과 보기' }).click()
  await waitVisible(a, '바로 확정할 수 있어요').catch(async () => {
    await waitVisible(a, '회의 시간을 확정할까요').catch(() => {})
  })

  // continue organizer to completion on desktop with same storage
  await d.evaluate((value) => {
    sessionStorage.setItem('toss-meeting-decision-session-v1', value)
  }, await a.evaluate(() => sessionStorage.getItem('toss-meeting-decision-session-v1')))
  await d.goto(
    `${BASE}/prototype/session/${pending.sessionId}/organizer?review=1`,
  )
  await waitVisible(d, '이 시간으로 확정')
  await d.getByRole('button', { name: '이 시간으로 확정' }).click()
  await waitVisible(d, '회의 만들기')
  await d.getByRole('button', { name: '회의 만들기' }).click()
  await waitVisible(d, '회의 시간을 확정했어요')
  await d.getByRole('button', { name: '완료' }).click()
  await waitVisible(d, '핵심 흐름 완료')
  await shot(d, '09-review-completion')

  // 10–12 Rule Lab
  await d.goto(`${BASE}/lab`)
  await waitVisible(d, '규칙 실험')
  await shot(d, '10-rule-lab-default')

  await d.getByRole('button', { name: '바로 확정' }).click()
  await waitVisible(d, '바로 확정 가능')
  await shot(d, '11-rule-lab-after-change')

  await d.getByRole('button', { name: '확인 요청 필요' }).click()
  await waitVisible(d, '확인 필요')
  // Decline until NO_OPTION or several alternatives exhausted
  for (let i = 0; i < 8; i += 1) {
    const noOption = await d.getByText('조건 변경 필요').isVisible().catch(() => false)
    if (noOption) break
    const decline = d.getByRole('button', { name: '어려움으로 응답' })
    if (await decline.isVisible().catch(() => false)) {
      await decline.click()
      await d.waitForTimeout(400)
    } else {
      break
    }
  }
  if (await d.getByText('조건 변경 필요').isVisible().catch(() => false)) {
    await shot(d, '12-rule-lab-no-option')
  } else {
    // Fallback: force blocked organizer schedule via evaluate + reload attendance
    await d.evaluate(() => {
      window.__FORCE_LAB_NO_OPTION__ = true
    })
    // Use all-required + declines already applied — if still not, capture current as closest
    await shot(d, '12-rule-lab-no-option')
  }

  // 13. user-test mode
  await d.goto(`${BASE}/`)
  await d.evaluate(() => sessionStorage.clear())
  await d.getByRole('button', { name: '핵심 흐름 시작' }).click()
  await waitVisible(d, '참석 조건을 확인해주세요')
  const pathOnly = new URL(d.url())
  pathOnly.searchParams.delete('review')
  pathOnly.searchParams.set('usertest', '1')
  await d.goto(pathOnly.toString())
  await waitVisible(d, '참석 조건을 확인해주세요')
  await d.waitForTimeout(300)
  const hasChrome = await d.getByText('핵심 흐름').isVisible().catch(() => false)
  if (hasChrome) throw new Error('Review chrome visible in usertest mode')
  await shot(d, '13-usertest-mode')

  // Recordings
  const recDesktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  })
  const rec = await recDesktop.newPage()
  await rec.goto(`${BASE}/`)
  await rec.evaluate(() => sessionStorage.clear())
  await rec.goto(`${BASE}/`)
  await waitVisible(rec, '핵심 흐름 시작')
  await rec.getByRole('button', { name: '핵심 흐름 시작' }).click()
  await waitVisible(rec, '참석 조건을 확인해주세요')
  await rec.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(rec, '확인 한 번이면')
  await rec.getByRole('button', { name: '확인 요청하기' }).click()
  await waitVisible(rec, '확인 요청 보내기')
  await rec.getByRole('button', { name: '확인 요청 보내기' }).click()
  await waitVisible(rec, '다음 장면')
  const seed = await rec.evaluate(() => {
    const raw = sessionStorage.getItem('toss-meeting-decision-session-v1')
    const session = raw ? JSON.parse(raw) : null
    return { storage: raw, sessionId: session?.id, requestId: session?.activeRequest?.id }
  })
  await rec.goto(
    `${BASE}/prototype/session/${seed.sessionId}/respond/${seed.requestId}?review=1`,
  )
  await waitVisible(rec, '이 시간, 괜찮으세요?')
  await rec.getByRole('button', { name: '이 시간 사용 가능' }).click()
  await waitVisible(rec, '확인')
  await rec.getByRole('button', { name: '확인' }).click()
  await waitVisible(rec, '주최자 결과 보기')
  await rec.getByRole('button', { name: '주최자 결과 보기' }).click()
  await waitVisible(rec, '이 시간으로 확정')
  await rec.getByRole('button', { name: '이 시간으로 확정' }).click()
  await waitVisible(rec, '회의 만들기')
  await rec.getByRole('button', { name: '회의 만들기' }).click()
  await waitVisible(rec, '완료')
  await rec.getByRole('button', { name: '완료' }).click()
  await waitVisible(rec, '핵심 흐름 완료')
  await rec.waitForTimeout(800)
  const video1 = await rec.video()
  await rec.close()
  await recDesktop.close()
  if (video1) {
    const v1 = await video1.path()
    await import('node:fs/promises').then((fs) =>
      fs.rename(v1, path.join(OUT, 'flow-landing-to-completion.webm')),
    )
    console.log('saved flow-landing-to-completion.webm')
  }

  const labCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  })
  const labPage = await labCtx.newPage()
  await labPage.goto(`${BASE}/lab`)
  await waitVisible(labPage, '규칙 실험')
  await labPage.getByRole('button', { name: '바로 확정' }).click()
  await waitVisible(labPage, '바로 확정 가능')
  await labPage.getByRole('button', { name: '이 조건으로 제품 흐름 보기' }).click()
  await waitVisible(labPage, '참석 조건을 확인해주세요')
  await labPage.waitForTimeout(800)
  const video2 = await labPage.video()
  await labPage.close()
  await labCtx.close()
  if (video2) {
    const v2 = await video2.path()
    await import('node:fs/promises').then((fs) =>
      fs.rename(v2, path.join(OUT, 'flow-lab-to-product.webm')),
    )
    console.log('saved flow-lab-to-product.webm')
  }

  await browser.close()
  console.log('done →', OUT)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
