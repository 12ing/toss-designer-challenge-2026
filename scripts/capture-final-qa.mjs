/**
 * Final regression QA captures for meeting finalize flow.
 * Output: doc/screenshots-final-qa/
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../doc/screenshots-final-qa')
const BASE = 'http://localhost:5173'

async function clearAndStart(page, query = 'review=1') {
  await page.goto(`${BASE}/?${query}`)
  await page.evaluate(() => sessionStorage.clear())
  await page.goto(`${BASE}/?${query}`)
  await page.getByRole('button', { name: '핵심 흐름 시작' }).click()
  await page.getByText('참석 조건을 확인해주세요').waitFor()
}

async function makeReady(page) {
  const groups = page.getByRole('radiogroup')
  await groups.nth(0).getByRole('radio', { name: '선택' }).click()
  await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
  await page
    .getByRole('button', { name: '이 시간으로 확정' })
    .waitFor({ timeout: 5000 })
}

async function createMeeting(page, { title, location }) {
  await page.getByRole('button', { name: '이 시간으로 확정' }).click()
  await page.getByText('이 시간으로 회의를 만들까요?').waitFor()
  await page.getByLabel('회의 제목').fill(title)
  if (location) {
    await page.getByLabel('장소 또는 화상 회의 링크').fill(location)
  }
  await page.getByRole('button', { name: '회의 만들기' }).click()
  await page.getByText('회의를 만들었어요.').waitFor({ timeout: 5000 })
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const report = { e2e: {}, refresh: {}, modes: {} }

  {
    const page = await (
      await browser.newContext({ viewport: { width: 1440, height: 900 } })
    ).newPage()
    await clearAndStart(page)
    await makeReady(page)
    await page.getByRole('button', { name: '이 시간으로 확정' }).click()
    await page.getByText('이 시간으로 회의를 만들까요?').waitFor()
    await page.screenshot({
      path: path.join(OUT, '01-meeting-details-desktop.png'),
      fullPage: true,
    })

    await page.getByLabel('회의 제목').fill('   ')
    await page.getByRole('button', { name: '회의 만들기' }).click()
    await page.getByText('회의 제목을 입력해 주세요.').waitFor()
    report.e2e.validationKeepsValue =
      (await page.getByLabel('회의 제목').inputValue()) === '   '
    await page.screenshot({ path: path.join(OUT, '03-title-validation.png') })

    await page.getByLabel('회의 제목').fill('제품 킥오프')
    await page
      .getByLabel('장소 또는 화상 회의 링크')
      .fill('https://meet.example.com/room')
    await page.screenshot({ path: path.join(OUT, '04-location-or-link.png') })

    await page.getByRole('button', { name: '회의 만들기' }).click()
    await page.getByText('만드는 중').waitFor({ timeout: 2000 }).catch(() => {})
    await page.screenshot({ path: path.join(OUT, '05-create-loading.png') })
    await page.getByText('회의를 만들었어요.').waitFor()
    await page.screenshot({
      path: path.join(OUT, '06-product-completion-desktop.png'),
      fullPage: true,
    })

    const before = await page.evaluate(() => {
      const s = JSON.parse(
        sessionStorage.getItem('toss-meeting-decision-session-v1'),
      )
      return s.createdMeeting
    })
    await page.reload()
    await page.getByText('회의를 만들었어요.').waitFor()
    await page.getByText('제품 킥오프').waitFor()
    await page.screenshot({
      path: path.join(OUT, '08-product-completion-refresh.png'),
    })
    const after = await page.evaluate(() => {
      const s = JSON.parse(
        sessionStorage.getItem('toss-meeting-decision-session-v1'),
      )
      return s.createdMeeting
    })
    report.refresh.completed = {
      sameId: before.id === after.id,
      sameTitle: after.title === '제품 킥오프',
      sameLocation: after.location === 'https://meet.example.com/room',
      hasSlot: Boolean(after.slotId),
      hasCreatedAt: Boolean(after.createdAt),
      record: after,
    }

    await page.evaluate(() => {
      const s = JSON.parse(
        sessionStorage.getItem('toss-meeting-decision-session-v1'),
      )
      s.phase = 'meeting-details'
      sessionStorage.setItem(
        'toss-meeting-decision-session-v1',
        JSON.stringify(s),
      )
    })
    await page.reload()
    await page.getByText('이미 만든 회의예요.').waitFor()
    await page.screenshot({
      path: path.join(OUT, '09-already-created-reentry.png'),
    })
    report.e2e.reentry = true
    await page.close()
  }

  {
    const page = await (
      await browser.newContext({ viewport: { width: 390, height: 844 } })
    ).newPage()
    await clearAndStart(page)
    await makeReady(page)
    await page.getByRole('button', { name: '이 시간으로 확정' }).click()
    await page.screenshot({
      path: path.join(OUT, '02-meeting-details-mobile.png'),
      fullPage: true,
    })
    await page.getByLabel('회의 제목').fill('모바일 킥오프')
    await page.getByLabel('장소 또는 화상 회의 링크').fill('4층 A')
    await page.getByRole('button', { name: '회의 만들기' }).click()
    await page.getByText('회의를 만들었어요.').waitFor()
    await page.screenshot({
      path: path.join(OUT, '07-product-completion-mobile.png'),
      fullPage: true,
    })
    const body = await page.locator('body').innerText()
    report.e2e.noFakeCalendar =
      !body.includes('캘린더에 추가') &&
      !body.includes('초대 메일') &&
      !body.includes('참석자 캘린더')
    await page.close()
  }

  {
    const page = await (
      await browser.newContext({ viewport: { width: 1440, height: 900 } })
    ).newPage()
    await clearAndStart(page)
    await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
    await page.getByText('확인 한 번이면').waitFor()
    await page.evaluate(() => {
      const s = JSON.parse(
        sessionStorage.getItem('toss-meeting-decision-session-v1'),
      )
      s.phase = 'meeting-details'
      sessionStorage.setItem(
        'toss-meeting-decision-session-v1',
        JSON.stringify(s),
      )
    })
    await page.reload()
    await page.getByText('추천 시간이 더 이상 유효하지 않아요.').waitFor()
    await page.screenshot({
      path: path.join(OUT, '10-invalid-finalize-recovery.png'),
    })
    report.e2e.invalidFinalize = true
    await page.close()
  }

  {
    const page = await (
      await browser.newContext({ viewport: { width: 390, height: 844 } })
    ).newPage()
    await page.goto(
      `${BASE}/prototype/session/session_missing_xyz/organizer?review=1`,
    )
    await page.evaluate(() => sessionStorage.clear())
    await page.reload()
    await page.getByText('진행 중이던 내용을 찾을 수 없어요.').waitFor()
    report.e2e.missingSession = true
    await page.goto(
      `${BASE}/prototype/session/session_missing_xyz/respond/req_missing?review=1`,
    )
    await page.getByText(/찾을 수 없어요/).waitFor()
    report.e2e.missingRequest = true
    await page.close()
  }

  {
    const page = await (
      await browser.newContext({ viewport: { width: 1440, height: 900 } })
    ).newPage()
    await clearAndStart(page)
    await makeReady(page)
    await page.getByRole('button', { name: '이 시간으로 확정' }).click()
    await page.getByLabel('회의 제목').fill('임시 제목')
    await page.getByLabel('장소 또는 화상 회의 링크').fill('회의실 B')
    await page.reload()
    await page.getByText('이 시간으로 회의를 만들까요?').waitFor()
    report.refresh.meetingDetails = {
      title: await page.getByLabel('회의 제목').inputValue(),
      location: await page
        .getByLabel('장소 또는 화상 회의 링크')
        .inputValue(),
    }
    await page.close()
  }

  {
    const page = await (
      await browser.newContext({ viewport: { width: 1440, height: 900 } })
    ).newPage()
    await clearAndStart(page, 'usertest=1')
    report.modes.usertestNoLab =
      (await page.getByText('결정 규칙 실험하기').count()) === 0
    await makeReady(page)
    await createMeeting(page, { title: '유저테스트 회의' })
    report.modes.usertestNoReviewChrome =
      (await page.getByText('설계 근거').count()) === 0
    await page.getByRole('button', { name: '완료' }).click()
    await page.getByRole('button', { name: '핵심 흐름 시작' }).waitFor({
      timeout: 5000,
    })
    report.modes.usertestEndsAtLanding = true
    await page.close()
  }

  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
    })
    const page = await context.newPage()
    await clearAndStart(page)
    await makeReady(page)
    await createMeeting(page, { title: 'READY 직접 확정', location: 'Zoom' })
    await page.getByRole('button', { name: '완료' }).click()
    await page.getByText('핵심 흐름 완료').waitFor()
    const v = await page.video().path()
    await context.close()
    fs.renameSync(v, path.join(OUT, '11-ready-direct-confirm.webm'))
    report.e2e.pathA = true
  }

  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
    })
    const page = await context.newPage()
    await clearAndStart(page)
    await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
    await page.getByRole('button', { name: '확인 요청하기' }).click()
    await page.getByRole('button', { name: '확인 요청 보내기' }).click()
    await page.getByRole('button', { name: '참석자 응답 보기' }).click()
    await page.getByRole('button', { name: '이 시간 사용 가능' }).click()
    await page.getByRole('button', { name: '주최자 결과 보기' }).click()
    await page.getByText('이제 확정할 수 있어요').waitFor({ timeout: 5000 })
    await createMeeting(page, { title: '승인 후 회의' })
    const v = await page.video().path()
    await context.close()
    fs.renameSync(v, path.join(OUT, '12-approve-then-create.webm'))
    report.e2e.pathB = true
  }

  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
    })
    const page = await context.newPage()
    await clearAndStart(page)
    await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
    await page.getByRole('button', { name: '확인 요청하기' }).click()
    await page.getByRole('button', { name: '확인 요청 보내기' }).click()
    await page.getByRole('button', { name: '참석자 응답 보기' }).click()
    await page.getByRole('button', { name: '이 시간은 어려워요' }).click()
    await page.getByRole('button', { name: '주최자 결과 보기' }).click()
    await page
      .getByText('다음으로 조율이 적은 시간을 찾았어요')
      .waitFor({ timeout: 5000 })
    await page.getByRole('button', { name: '확인 요청하기' }).click()
    await page.getByRole('button', { name: '확인 요청 보내기' }).click()
    await page.getByRole('button', { name: '참석자 응답 보기' }).click()
    await page.getByRole('button', { name: '이 시간 사용 가능' }).click()
    await page.getByRole('button', { name: '주최자 결과 보기' }).click()
    await page
      .getByRole('button', { name: '이 시간으로 확정' })
      .waitFor({ timeout: 5000 })
    await createMeeting(page, { title: '거절 후 재추천 회의' })
    const v = await page.video().path()
    await context.close()
    fs.renameSync(v, path.join(OUT, '13-decline-rerecommend-create.webm'))
    report.e2e.pathC = true
  }

  {
    const page = await (
      await browser.newContext({ viewport: { width: 390, height: 844 } })
    ).newPage()
    await clearAndStart(page)
    await page.getByRole('button', { name: '이 조건으로 시간 찾기' }).click()
    await page.getByRole('button', { name: '확인 요청하기' }).click()
    await page.getByRole('button', { name: '확인 요청 보내기' }).click()
    await page.getByRole('button', { name: '참석자 응답 보기' }).click()
    await page.getByRole('button', { name: '이 시간 사용 가능' }).click()
    await page.getByText('주최자가 회의를 확정하면').waitFor()
    await page.getByText('일정이 만들어져요.').waitFor()
    report.e2e.attendeeCopyUpdated = true
    await page.close()
  }

  fs.writeFileSync(path.join(OUT, 'qa-report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  console.log(
    'files\n' +
      fs
        .readdirSync(OUT)
        .sort()
        .join('\n'),
  )
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
