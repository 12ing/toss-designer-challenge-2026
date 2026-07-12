import { mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = path.resolve('doc/screenshots-p4')

async function shot(page, name) {
  await page.waitForTimeout(350)
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

async function clearSession(page) {
  await page.goto(`${BASE}/`)
  await page.evaluate(() => sessionStorage.clear())
}

async function startCoordination(page) {
  await clearSession(page)
  await page.goto(`${BASE}/prototype?scenario=coordination`)
  await waitVisible(page, '참석 조건을 확인해주세요')
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(page, '확인 한 번이면 필수 참석자 모두 가능해요.')
}

async function sendRequestFlow(page, { shotPreview = false } = {}) {
  await page.getByRole('button', { name: '확인 요청하기' }).click()
  await waitVisible(page, '이렇게 확인할게요')
  if (shotPreview) await shot(page, '01-request-preview')
  await page.getByRole('button', { name: '확인 요청 보내기' }).click()
  await waitVisible(page, '응답을 기다리고 있어요.')
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  const page = await desktop.newPage()

  // 1–3: preview, waiting, review shell with notification
  await startCoordination(page)
  await sendRequestFlow(page, { shotPreview: true })
  await shot(page, '02-organizer-waiting')
  await shot(page, '03-review-shell-notification')
  await shot(page, '11-review-mode')

  // 4: attendee mobile request
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  })
  const m = await mobile.newPage()
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
  await shot(m, '04-attendee-request')

  // 5: approve complete
  await m.getByRole('button', { name: '이 시간 사용 가능' }).click()
  await waitVisible(m, '가능하다고 전달했어요.')
  await shot(m, '05-attendee-approved')

  // 6: organizer ready after confirmation
  await m.getByRole('button', { name: '확인' }).click()
  await waitVisible(m, '이제 확정할 수 있어요.')
  await shot(m, '06-organizer-ready-after-approval')
  await mobile.close()

  // Decline path
  await startCoordination(page)
  await sendRequestFlow(page)
  const storage2 = await page.evaluate(() =>
    sessionStorage.getItem('toss-meeting-decision-session-v1'),
  )
  const requestId2 = await page.evaluate(() => {
    const raw = sessionStorage.getItem('toss-meeting-decision-session-v1')
    return raw ? JSON.parse(raw).activeRequest?.id : null
  })
  const mobile2 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  })
  const m2 = await mobile2.newPage()
  await m2.goto(`${BASE}/`)
  await m2.evaluate((value) => {
    sessionStorage.setItem('toss-meeting-decision-session-v1', value)
  }, storage2)
  await m2.goto(`${BASE}/prototype/respond/${requestId2}?scenario=coordination`)
  await waitVisible(m2, '이 시간, 괜찮으세요?')
  await m2.getByRole('button', { name: '이 시간은 어려워요' }).click()
  await waitVisible(m2, '어렵다고 전달했어요.')
  await shot(m2, '07-attendee-declined')
  await m2.getByRole('button', { name: '확인' }).click()
  await waitVisible(m2, '다음으로 조율이 적은 시간을 찾았어요.')
  await shot(m2, '08-organizer-next-alternative')
  await mobile2.close()

  // 9: already responded re-entry
  await startCoordination(page)
  await sendRequestFlow(page)
  const storage3 = await page.evaluate(() =>
    sessionStorage.getItem('toss-meeting-decision-session-v1'),
  )
  const requestId3 = await page.evaluate(() => {
    const raw = sessionStorage.getItem('toss-meeting-decision-session-v1')
    return raw ? JSON.parse(raw).activeRequest?.id : null
  })
  const mobile3 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  })
  const m3 = await mobile3.newPage()
  await m3.goto(`${BASE}/`)
  await m3.evaluate((value) => {
    sessionStorage.setItem('toss-meeting-decision-session-v1', value)
  }, storage3)
  await m3.goto(`${BASE}/prototype/respond/${requestId3}?scenario=coordination`)
  await waitVisible(m3, '이 시간, 괜찮으세요?')
  await m3.getByRole('button', { name: '이 시간 사용 가능' }).click()
  await waitVisible(m3, '가능하다고 전달했어요.')
  // re-enter same URL
  await m3.goto(`${BASE}/prototype/respond/${requestId3}?scenario=coordination`)
  await waitVisible(m3, '가능하다고 전달했어요.')
  const responseButtons = await m3
    .getByRole('button', { name: '이 시간 사용 가능' })
    .count()
  if (responseButtons > 0) {
    console.warn('warning: response buttons still visible on re-entry')
  }
  await shot(m3, '09-already-responded')
  await mobile3.close()

  // 10: invalid request id
  await page.goto(`${BASE}/prototype/respond/invalid-request-id`)
  await waitVisible(page, '요청을 찾을 수 없어요.')
  await shot(page, '10-invalid-request')

  // 12: user-test mode (no review shell on waiting)
  await clearSession(page)
  await page.goto(`${BASE}/prototype?scenario=coordination&usertest=1`)
  await waitVisible(page, '참석 조건을 확인해주세요')
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(page, '확인 한 번이면 필수 참석자 모두 가능해요.')
  await page.getByRole('button', { name: '확인 요청하기' }).click()
  await page.getByRole('button', { name: '확인 요청 보내기' }).click()
  await waitVisible(page, '응답을 기다리고 있어요.')
  await page.waitForTimeout(400)
  const hasReview = await page.getByText('참석자 알림 열기').count()
  if (hasReview > 0) {
    console.warn('warning: review nav visible in usertest mode')
  }
  await shot(page, '12-user-test-mode')

  // Videos
  const videoApprove = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: OUT, size: { width: 1280, height: 800 } },
  })
  const va = await videoApprove.newPage()
  await clearSession(va)
  await va.goto(`${BASE}/prototype?scenario=coordination`)
  await waitVisible(va, '참석 조건을 확인해주세요')
  await va.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(va, '확인 한 번이면')
  await va.getByRole('button', { name: '확인 요청하기' }).click()
  await va.getByRole('button', { name: '확인 요청 보내기' }).click()
  await waitVisible(va, '응답을 기다리고 있어요.')
  await va.getByRole('link', { name: '참석자 알림 열기' }).click()
  await waitVisible(va, '이 시간, 괜찮으세요?')
  await va.getByRole('button', { name: '이 시간 사용 가능' }).click()
  await waitVisible(va, '가능하다고 전달했어요.')
  await va.getByRole('button', { name: '확인' }).click()
  await waitVisible(va, '이제 확정할 수 있어요.')
  await va.waitForTimeout(600)
  const approveVideo = await va.video().path()
  await videoApprove.close()
  await rename(approveVideo, path.join(OUT, 'video-approve-to-ready.webm'))
  console.log('saved', 'video-approve-to-ready')

  const videoDecline = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: OUT, size: { width: 1280, height: 800 } },
  })
  const vd = await videoDecline.newPage()
  await clearSession(vd)
  await vd.goto(`${BASE}/prototype?scenario=coordination`)
  await waitVisible(vd, '참석 조건을 확인해주세요')
  await vd.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await waitVisible(vd, '확인 한 번이면')
  await vd.getByRole('button', { name: '확인 요청하기' }).click()
  await vd.getByRole('button', { name: '확인 요청 보내기' }).click()
  await waitVisible(vd, '응답을 기다리고 있어요.')
  await vd.getByRole('link', { name: '참석자 알림 열기' }).click()
  await waitVisible(vd, '이 시간, 괜찮으세요?')
  await vd.getByRole('button', { name: '이 시간은 어려워요' }).click()
  await waitVisible(vd, '어렵다고 전달했어요.')
  await vd.getByRole('button', { name: '확인' }).click()
  await waitVisible(vd, '다음으로 조율이 적은 시간을 찾았어요.')
  await vd.waitForTimeout(600)
  const declineVideo = await vd.video().path()
  await videoDecline.close()
  await rename(declineVideo, path.join(OUT, 'video-decline-to-alternative.webm'))
  console.log('saved', 'video-decline-to-alternative')

  await desktop.close()
  await browser.close()
  console.log('done →', OUT)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
