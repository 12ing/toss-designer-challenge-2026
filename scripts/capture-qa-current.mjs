import { mkdir, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-qa-current')

async function shot(page, name, options = {}) {
  await page.waitForTimeout(300)
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

async function clearAndStart(page) {
  await page.goto(`${BASE}/`)
  await page.evaluate(() => sessionStorage.clear())
  await page.goto(`${BASE}/`)
  await waitText(page, '핵심 플로우 시작')
  await page.getByRole('button', { name: '핵심 플로우 시작' }).click()
  await waitText(page, '참석 조건을 확인해주세요')
}

async function toNeedConfirmation(page) {
  await clearAndStart(page)
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitText(page, '확인 한 번이면')
}

async function toWaiting(page) {
  await toNeedConfirmation(page)
  await page.getByRole('button', { name: '가능 여부 묻기' }).click()
  await waitText(page, '요청 보내기')
  await page.getByRole('button', { name: '요청 보내기' }).click()
  await waitText(page, '응답을 기다리고 있어요')
  await waitText(page, '참석자 응답 보기')
}

async function toNoOption(page) {
  await page.goto(`${BASE}/`)
  await page.evaluate(() => sessionStorage.clear())
  await page.goto(`${BASE}/?review=1&fixture=no-option`)
  await page.getByRole('button', { name: '핵심 플로우 시작' }).click()
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
}

async function saveVideo(context, page, name) {
  const video = page.video()
  await context.close()
  if (!video) return
  await rename(await video.path(), path.join(OUT, `${name}.webm`))
  console.log('saved', `${name}.webm`)
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  const manifest = []

  // 01 Landing desktop
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/`)
    await waitText(page, '핵심 플로우 시작')
    await shot(page, '01-landing-desktop-1440')
    manifest.push('01 Landing desktop 1440×900')
    await ctx.close()
  }

  // 02–03 Landing mobile
  for (const [w, name, label] of [
    [390, '02-landing-mobile-390', 'Landing mobile 390'],
    [320, '03-landing-mobile-320', 'Landing mobile 320'],
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: 844 },
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/`)
    await waitText(page, '핵심 플로우 시작')
    await shot(page, name)
    manifest.push(`0${name.slice(0, 1) === '0' ? '' : ''}${label}`)
    await ctx.close()
  }
  manifest[1] = '02 Landing mobile 390'
  manifest[2] = '03 Landing mobile 320'

  // 04 Setup desktop
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await clearAndStart(page)
    await shot(page, '04-setup-desktop')
    manifest.push('04 Attendance setup desktop')
    await ctx.close()
  }

  // 05 Setup mobile
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    const page = await ctx.newPage()
    await clearAndStart(page)
    await shot(page, '05-setup-mobile')
    manifest.push('05 Attendance setup mobile')
    await ctx.close()
  }

  // 06 Privacy hover desktop
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await clearAndStart(page)
    await page.getByRole('button', { name: '일정 조건 안내' }).hover()
    await page.waitForTimeout(250)
    await waitText(page, '조율에 필요한 정보만')
    await shot(page, '06-privacy-tooltip-hover')
    manifest.push('06 Privacy tooltip hover')
    await ctx.close()
  }

  // 07 NEED_CONFIRMATION people panel
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await toNeedConfirmation(page)
    await shot(page, '07-decision-need-confirmation')
    manifest.push('07 Decision NEED_CONFIRMATION + people')
    await ctx.close()
  }

  // 08 Reason panel
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await toNeedConfirmation(page)
    await page.getByRole('button', { name: '이 시간을 고른 이유' }).click()
    await waitText(page, '필수 참석 조건')
    await shot(page, '08-decision-reason-panel')
    manifest.push('08 Decision reason panel')
    await ctx.close()
  }

  // 09 People return
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await toNeedConfirmation(page)
    await page.getByRole('button', { name: '이 시간을 고른 이유' }).click()
    await page.getByRole('button', { name: '참석 상황 보기' }).first().click()
    await waitText(page, '참석 상황')
    await shot(page, '09-decision-people-return')
    manifest.push('09 Decision people return')
    await ctx.close()
  }

  // 10 WAITING + review panel desktop
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await toWaiting(page)
    await shot(page, '10-waiting-review-panel-desktop')
    const scroll = await page.evaluate(() => ({
      doc: document.documentElement.scrollHeight,
      win: window.innerHeight,
    }))
    await page.evaluate((info) => {
      const el = document.createElement('div')
      el.textContent = `scrollHeight=${info.doc} innerHeight=${info.win}`
      el.style.cssText =
        'position:fixed;left:8px;bottom:8px;z-index:9999;background:#fff;border:1px solid #ccc;padding:6px 8px;font:12px monospace'
      document.body.appendChild(el)
    }, scroll)
    await shot(page, '11-waiting-1440-no-scroll')
    manifest.push('10 WAITING + Review panel desktop')
    manifest.push('11 WAITING 1440 no-scroll metric')
    await ctx.close()
  }

  // 12 WAITING mobile
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    const page = await ctx.newPage()
    await toWaiting(page)
    await shot(page, '12-waiting-review-panel-mobile')
    manifest.push('12 WAITING + Review panel mobile')
    await ctx.close()
  }

  // 13 usertest — no review panel
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await toNeedConfirmation(page)
    const url = new URL(page.url())
    url.searchParams.delete('review')
    url.searchParams.set('usertest', '1')
    await page.goto(url.toString())
    await waitText(page, '확인 한 번이면')
    await page.getByRole('button', { name: '가능 여부 묻기' }).click()
    await page.getByRole('button', { name: '요청 보내기' }).click()
    await waitText(page, '응답을 기다리고 있어요')
    await page.waitForTimeout(500)
    const hasReview = await page.getByText('참석자 응답 보기').count()
    if (hasReview > 0) throw new Error('Review panel visible in usertest')
    await shot(page, '13-waiting-usertest-no-review')
    manifest.push('13 WAITING usertest (no Review UI)')
    await ctx.close()
  }

  // 14 Mobile reason sheet
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    const page = await ctx.newPage()
    await toNeedConfirmation(page)
    await page.getByRole('button', { name: '이 시간을 고른 이유' }).click()
    await waitText(page, '필수 참석 조건')
    await shot(page, '14-mobile-reason-sheet')
    manifest.push('14 Mobile reason bottom sheet')
    await ctx.close()
  }

  // 15 NO_OPTION
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await toNoOption(page)
    await shot(page, '15-no-option')
    manifest.push('15 NO_OPTION')
    await ctx.close()
  }

  // 16 READY branch
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await clearAndStart(page)
    await page.getByRole('button', { name: '다른 장면' }).click()
    await page.getByRole('button', { name: '바로 확정 가능한 경우' }).click()
    await waitText(page, '참석 조건을 확인해주세요')
    await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
    await waitText(page, '바로 확정할 수 있어요')
    await shot(page, '16-ready')
    manifest.push('16 READY')
    await ctx.close()
  }

  // 17 Design note drawer
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await clearAndStart(page)
    await page.getByRole('button', { name: '설계 의도' }).click()
    await waitText(page, '제품 철학')
    await shot(page, '17-design-note-philosophy')
    manifest.push('17 Design note with product philosophy')
    await ctx.close()
  }

  // 18 Rule Lab NEED_CONFIRMATION
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/lab`)
    await waitText(page, '조건을 바꾸면 같은 기준으로 다시 계산해요')
    await page.getByRole('button', { name: '기본 조율 필요' }).click()
    await waitText(page, '확인 필요')
    await shot(page, '18-rule-lab-need-confirmation')
    manifest.push('18 Rule Lab NEED_CONFIRMATION')
    await ctx.close()
  }

  // 19 Rule Lab READY
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/lab`)
    await page.getByRole('button', { name: '바로 확정' }).click()
    await waitText(page, '바로 확정 가능')
    await shot(page, '19-rule-lab-ready')
    manifest.push('19 Rule Lab READY')
    await ctx.close()
  }

  // 20 Rule Lab mobile collapsed rules
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/lab`)
    await waitText(page, '조건을 바꾸면')
    await shot(page, '20-rule-lab-mobile')
    manifest.push('20 Rule Lab mobile')
    await ctx.close()
  }

  // 21 Attendee response
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    const page = await ctx.newPage()
    await toWaiting(page)
    await page.getByRole('button', { name: '참석자 응답 보기' }).click()
    await waitText(page, '회의 참석 가능 여부를 물었어요')
    await shot(page, '21-attendee-request')
    manifest.push('21 Attendee request')
    await ctx.close()
  }

  // 22 Completion
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    await clearAndStart(page)
    await page.getByRole('button', { name: '다른 장면' }).click()
    await page.getByRole('button', { name: '바로 확정 가능한 경우' }).click()
    await waitText(page, '참석 조건을 확인해주세요')
    await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
    await waitText(page, '바로 확정할 수 있어요')
    await page.getByRole('button', { name: '이 시간으로 확정' }).click()
    await waitText(page, '이 시간으로 회의를 만들까요')
    await page.getByRole('button', { name: '회의 만들기' }).click()
    await waitText(page, '회의 시간을 확정했어요')
    await page.getByRole('button', { name: '완료' }).click()
    await waitText(page, '핵심 플로우 완료')
    await shot(page, '22-review-completion')
    manifest.push('22 Review completion')
    await ctx.close()
  }

  // Videos
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
    })
    const page = await ctx.newPage()
    await toNoOption(page)
    await page.waitForTimeout(600)
    await page.getByRole('button', { name: '참석 조건 다시 보기' }).click()
    await waitText(page, '참석 조건을 확인해주세요')
    await page.waitForTimeout(800)
    await saveVideo(ctx, page, '23-no-option-change-conditions')
    manifest.push('23 Video: NO_OPTION → change conditions')
  }

  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
    })
    const page = await ctx.newPage()
    await clearAndStart(page)
    await page.getByRole('button', { name: '다른 장면' }).click()
    await page.getByRole('button', { name: '바로 확정 가능한 경우' }).click()
    await waitText(page, '참석 조건을 확인해주세요')
    await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
    await waitText(page, '바로 확정할 수 있어요')
    await page.getByRole('button', { name: '이 시간으로 확정' }).click()
    await page.getByRole('button', { name: '회의 만들기' }).click()
    await waitText(page, '회의 시간을 확정했어요')
    await page.getByRole('button', { name: '완료' }).click()
    await waitText(page, '핵심 플로우 완료')
    await page.getByRole('link', { name: '처음으로' }).click()
    await waitText(page, '핵심 플로우 시작')
    await page.getByRole('button', { name: '핵심 플로우 시작' }).click()
    await waitText(page, '참석 조건을 확인해주세요')
    await page.waitForTimeout(800)
    await saveVideo(ctx, page, '24-restart-core-flow')
    manifest.push('24 Video: complete → home → restart fresh')
  }

  const readme = [
    '# QA screenshots — current build',
    '',
    `Captured: ${new Date().toISOString()}`,
    `Base: ${BASE}`,
    '',
    ...manifest.map((line, i) => `${i + 1}. ${line.replace(/^\d+\s*/, '')}`),
    '',
    '## Checklist focus',
    '- Landing first viewport + copy',
    '- Fresh session on CTA restart',
    '- DecisionSurface people/reason inside card',
    '- 1440×900 no page scroll on WAITING',
    '- Review panel only with review=1',
    '- NO_OPTION CTA + copy',
    '- Rule Lab / design note / attendee / completion',
    '',
  ].join('\n')

  await writeFile(path.join(OUT, 'README.md'), readme)
  console.log('wrote README.md')
  await browser.close()
  console.log('done →', OUT)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
