# Priority 5 — Reviewer Experience & Rule Lab

> Cursor implementation request  
> Scope: **Review landing, minimal review navigation, optional design notes, review completion, and rule lab**  
> Prerequisites:
> - Priority 1 dynamic decision engine is implemented.
> - Priority 2 Decision Surface is implemented.
> - Priority 3 participant setup and impact hierarchy are fixed.
> - Priority 4 organizer–attendee connected flow is implemented or its route/session contract is fixed.

---

# 0. Goal

Create a review environment that helps a Toss challenge evaluator understand, verify, and complete the product experience without turning the product into a presentation deck.

The review experience must answer within 10 seconds:

```text
What problem did this designer define?
What is the product's different solution?
Which flow should I experience first?
How long will it take?
```

The product itself must still stand on its own.

### Core principle

```text
Explain the design before and around the product.
Do not explain over the product.
```

Use:

- a review landing
- minimal review chrome
- optional design notes
- actor-transition guidance
- review completion
- a separate rule lab

Do not keep a large permanent explanation panel beside every product screen.

---

# 1. Why this patch is necessary

The product now has:

- a real decision engine
- dynamic required/optional inputs
- one Decision Surface
- person-level impact
- organizer–attendee synchronization

However, a reviewer may still miss:

- the root problem
- why there is only one recommendation
- why no calendar grid is shown
- why protected time requires consent
- why optional attendees do not block confirmation
- why attendee refusal produces a new recommendation
- which flow is the core submission flow

The review environment should reveal those decisions without adding explanatory copy to the product UI.

---

# 2. Scope

## Implement in this patch

- default review landing at `/`
- split hero with problem/solution and live product preview
- one primary review flow
- secondary entry to rule lab
- minimal review chrome in review mode
- optional step-specific design-note drawer
- actor-transition review guidance
- review completion screen
- rule lab at `/lab`
- review mode / user-test mode separation
- fresh session creation for each review run
- accessibility and responsive behavior
- analytics hooks suitable for local review diagnostics
- tests for routes, modes, and session reset

## Do not implement in this patch

- changes to meeting-decision rules
- changes to participant data
- redesign of the Decision Surface
- redesign of the attendee response screen
- extra product features
- a portfolio-style long-form case study
- a persistent large left sidebar during every product screen
- raw developer debug data in the default review experience
- automated scoring claims
- fake user research statistics
- full Figma-style presentation pages

---

# 3. Review information architecture

Use four distinct layers.

```text
1. Review Landing
   Understand the problem and start the core flow.

2. Product Flow
   Experience the real product without explanatory clutter.

3. Optional Design Notes
   Inspect the rule and design decision for the current step.

4. Rule Lab
   Change conditions and verify that the product works as a system.
```

Do not merge all four into one dashboard.

---

# 4. Route structure

Recommended routes:

```text
/                                      Review landing

/prototype/session/:sessionId/organizer
/prototype/session/:sessionId/respond/:requestId

/review/session/:sessionId/complete     Review completion

/lab                                   Rule lab
```

Mode query:

```text
?review=1       Reviewer guidance visible
?usertest=1     Product only, reviewer guidance hidden
?debug=1        Development diagnostics only
```

## Rules

- `/` defaults to review landing
- Primary CTA creates a new meeting-decision session
- review mode must not reuse stale approval/decline state
- every branch shortcut creates a fresh session
- user-test mode must never show design notes or reviewer navigation
- debug mode is separate from review mode

---

# 5. Review landing

## Layout

Desktop:

```text
┌──────────────────────────────┬──────────────────────────────┐
│ Problem and solution         │ Live product preview         │
│                              │                              │
│ Primary flow CTA             │ Read-only Decision Surface   │
│ Rule-lab secondary entry     │ based on real engine output  │
└──────────────────────────────┴──────────────────────────────┘
```

Recommended container:

```text
max-width: 1120px
grid: minmax(0, 1fr) minmax(420px, 520px)
gap: 64px
horizontal padding: 32px
```

Mobile:

```text
Problem and solution
Primary CTA
Live preview
Secondary review actions
```

Do not reproduce the full participant editor on the landing.

---

# 6. Landing copy

## Eyebrow

```text
Toss Product Designer Challenge 2026
```

## Headline

```text
6명의 일정을 비교하지 않고,
가장 적은 조율로 회의를 확정합니다.
```

## Problem statement

```text
주최자는 빈 시간을 찾는 것보다,
필수 참석·외근·개인 선호가 충돌할 때
무엇을 우선해야 할지 판단하기 어렵습니다.
```

## Solution statement

```text
여섯 개의 캘린더 대신
한 시간과 6명에게 미치는 영향,
그리고 필요한 다음 행동을 제안했습니다.
```

## Flow summary

```text
참석 조건 → 시간 제안 → 확인 요청 → 참석자 응답 → 확정
```

## Primary CTA

```text
핵심 플로우 시작
```

## Helper

```text
약 2분 · 공통 시간이 없는 상황부터 시작해요
```

## Secondary action

```text
조건을 직접 바꿔보기
```

This routes to `/lab`.

Do not show three equally weighted scenario cards on the landing.

---

# 7. Live product preview

The right side of the landing must use the real product components, not a screenshot.

Recommended:

```text
Read-only compact Decision Surface
```

Use a real engine seed that produces:

```text
NEED_CONFIRMATION
```

Preview content:

```text
7월 16일 목요일
오후 3:00–4:00

확인 한 번이면 필수 참석자가 모두 가능해요.

필수 4명
선택 2명
확인 대상 · 이지훈
```

Also show a compact six-person impact preview.

## Rules

- read-only
- no Primary product action inside preview
- no fake animation loop
- values derived from the Priority 1 engine
- use same typography and component language as the product
- label it only if needed:

```text
핵심 경험 미리보기
```

Do not label it `mockup`, `sample`, or `prototype component`.

---

# 8. What the landing must not become

Do not add all of the following simultaneously:

- long case-study introduction
- evaluation-criteria checklist
- five design-principle cards
- large process timeline
- challenge-condition card
- detailed engine diagram
- feature comparison table
- every alternate scenario

The landing is a 10-second orientation, not the submitted document.

Maximum recommended content before the fold:

- one headline
- one problem statement
- one solution statement
- one flow summary
- one Primary CTA
- one secondary action
- one live preview

---

# 9. Minimal review chrome

In `review=1` mode, show a small reviewer navigation layer outside the product.

Recommended height:

```text
44–52px
```

Example:

```text
핵심 플로우  2/5 · 시간 제안

[설계 의도]                         [처음으로]
```

## Required elements

- current review step
- optional `설계 의도` button
- `처음으로` or review-menu action

## Do not show

- large sidebar
- clickable steps competing with product CTA
- scenario controls
- engine scores
- persistent explanatory paragraph
- Toss evaluation criteria

## Step model

```ts
export type ReviewStep =
  | "attendance-conditions"
  | "time-recommendation"
  | "confirmation-request"
  | "attendee-response"
  | "meeting-confirmation";
```

Recommended labels:

```text
1. 참석 조건
2. 시간 제안
3. 확인 요청
4. 참석자 응답
5. 회의 확정
```

The step display is progress context, not default direct navigation.

A separate review menu may offer scene shortcuts.

---

# 10. Review mode product rule

The product area must remain identical between review and user-test modes.

Review mode may add only:

- external review chrome
- optional design-note drawer
- actor-transition guidance
- review completion navigation

Do not change:

- product copy
- product CTA hierarchy
- participant data
- recommendation result
- product card layout

This prevents reviewer assistance from masking product usability.

---

# 11. Optional design-note drawer

The `설계 의도` button opens a drawer or side sheet.

Default state:

```text
closed
```

Recommended desktop width:

```text
320–380px
```

On mobile:

```text
bottom sheet
```

## Drawer structure

```text
현재 단계
설계한 문제
적용된 규칙
의도적으로 만들지 않은 것
```

Maximum:

- 3 short sections
- 1–2 sentences each
- no long essay

---

# 12. Step-specific design notes

## 12.1 Attendance conditions

```text
설계한 문제
참석자는 이미 정해졌지만, 누가 꼭 참석해야 하는지는 회의마다 달라요.

적용된 규칙
필수 참석자는 회의 성립 조건으로, 선택 참석자는 참석 가능성을 높이는 조건으로 계산해요.

만들지 않은 것
사람 검색과 조직도는 이번 문제의 핵심이 아니어서 제외했어요.
```

## 12.2 Time recommendation

```text
설계한 문제
캘린더를 모두 보여주면 주최자가 다시 비교하고 판단해야 해요.

적용된 규칙
필수 충돌, 확인 횟수, 선호, 선택 참석 가능 순서로 한 시간을 제안해요.

만들지 않은 것
캘린더 그리드와 추천 시간 Top 3를 제공하지 않았어요.
```

## 12.3 Confirmation request

```text
설계한 문제
공통 시간이 없을 때 제품 밖에서 개인적으로 양보를 요청하게 돼요.

적용된 규칙
이동 가능한 보호 시간만 일정 소유자에게 중립적으로 확인해요.

만들지 않은 것
다른 사람의 일정을 자동으로 이동하지 않아요.
```

## 12.4 Attendee response

```text
설계한 문제
거절 사유를 요구하거나 다른 사람이 기다린다고 알리면 응답 부담이 커져요.

적용된 규칙
동의와 거절을 동일한 정상 상태로 다루고, 일정 내용과 사유를 공개하지 않아요.

만들지 않은 것
거절 사유 입력과 사회적 압박 문구를 넣지 않았어요.
```

## 12.5 Meeting confirmation

```text
설계한 문제
응답이 실제 그룹 결과에 반영됐는지 알기 어려울 수 있어요.

적용된 규칙
같은 결정 엔진이 다시 계산하고 사람 행의 상태만 제자리에서 바꿔요.

만들지 않은 것
누가 양보했는지 주최자에게 강조하지 않아요.
```

---

# 13. Design-note content source

Do not scatter note strings across product JSX.

Recommended:

```ts
export const reviewNotesByStep: Record<ReviewStep, ReviewNote>;
```

```ts
export type ReviewNote = {
  title: string;
  problem: string;
  rule: string;
  omitted: string;
};
```

Product components must not import these notes.

Review shell imports product state and maps it to a review step.

---

# 14. Actor transition guidance

Priority 4 connects the actors through one request object.

Review mode still needs to tell the evaluator why the viewport changes from organizer desktop to attendee mobile.

Use an external Review Transition card.

## Organizer waiting → attendee

```text
다음 장면

이지훈 님에게 일정 확인 알림이 도착했어요.

[ 참석자 알림 열기 ]
```

Optional compact notification preview:

```text
회의 시간 확인
김민지 님이 일정 가능 여부를 물었어요.
7월 16일 목요일 · 오후 3:00–4:00
```

## Attendee completion → organizer

Approval:

```text
응답이 주최자에게 반영됐어요.

[ 확정 가능한 시간 보기 ]
```

Decline:

```text
응답이 주최자에게 반영됐어요.

[ 새로 계산된 시간 보기 ]
```

## Rules

- outside product landmark
- visually quieter than product Primary CTA
- hidden in user-test mode
- uses the same session and request IDs
- never manually sets the outcome

---

# 15. Review completion screen

After the organizer completes the core connected flow, route to:

```text
/review/session/:sessionId/complete
```

## Required content

### Eyebrow

```text
핵심 플로우 완료
```

### Headline

```text
공통 시간이 없어도
확인과 응답을 연결해 회의를 확정했어요.
```

### Summary

```text
필수 참석 조건을 먼저 지키고,
이동 가능한 일정만 당사자에게 확인한 뒤,
응답 결과를 같은 규칙으로 다시 계산했습니다.
```

## Primary next action

```text
거절 후 재추천 보기
```

This creates a fresh session or uses a controlled branch from a new request.

## Secondary actions

```text
바로 확정 가능한 경우 보기
조건을 직접 바꿔보기
처음으로
```

Do not place all actions in identical Primary buttons.

Recommended hierarchy:

- Primary: 거절 후 재추천 보기
- Secondary: 바로 확정 가능한 경우 보기
- Text: 조건 직접 바꿔보기 / 처음으로

---

# 16. Branch shortcuts

Branch shortcuts are review utilities.

They must initialize inputs, not force output screens.

## Ready branch

Seed:

```text
이지훈 optional
```

Then call the real engine.

Expected:

```text
READY
```

## Decline branch

Start from coordination seed and use the real connected request flow.

Do not jump directly to a hardcoded next-alternative screen.

## All-required branch

Available in the rule lab, not a prominent landing action.

---

# 17. Rule Lab

Route:

```text
/lab
```

Purpose:

```text
Let the reviewer verify that the product is driven by reusable rules,
not pre-rendered scenarios.
```

The lab is not part of the end-user product.

Clearly label:

```text
규칙 실험
```

Supporting copy:

```text
필수·선택 조건을 바꾸면 같은 결정 엔진이 새로운 결과를 계산해요.
```

---

# 18. Rule Lab layout

Desktop:

```text
┌──────────────────────────────┬──────────────────────────────┐
│ Conditions                   │ Calculated result            │
│                              │                              │
│ Required / optional controls │ Decision Surface preview     │
│ Preset seeds                 │ Rule explanation             │
└──────────────────────────────┴──────────────────────────────┘
```

Recommended width:

```text
max-width: 1200px
left: 400–460px
right: minmax(0, 1fr)
```

Mobile:

```text
conditions
calculate
result
```

---

# 19. Rule Lab controls

Use the same participant attendance control component as the product.

## Required controls

- organizer required fixed
- other 5 required/optional
- reset
- calculate result

Optional preset seeds:

```text
기본 조율 필요
바로 확정
모두 필수
주최자만 필수
```

These presets may set input only.

Do not prefill result objects.

## Optional response simulation

Only after a `NEED_CONFIRMATION` result:

```text
사용 가능으로 응답
어려움으로 응답
```

These must apply real response overrides and recompute.

---

# 20. Rule Lab result

Show:

- human-readable result state
- calculated time
- required/optional summary
- confirmation target if any
- person-level impacts
- reason rows
- one product-preview CTA:

```text
이 조건으로 제품 흐름 보기
```

That CTA creates a fresh product session with the current lab inputs.

## Human labels

```text
READY                바로 확정 가능
NEED_CONFIRMATION    확인 필요
NO_OPTION            조건 변경 필요
```

Do not show enum labels by default.

---

# 21. Rule order explanation

The lab may show the reusable decision order.

Recommended:

```text
시간을 고르는 순서

1. 필수 참석자의 이동 불가 충돌이 없는가
2. 확인이 필요한 사람이 적은가
3. 필수 참석자의 선호 충돌이 적은가
4. 선택 참석자가 더 많이 가능한가
5. 이동과 연속 회의 부담이 적은가
```

Do not show:

- opaque total score
- weight sliders
- raw comparator vectors
- all candidate-slot diagnostics
- private event titles

Detailed debug values remain available only in `?debug=1`.

---

# 22. What was intentionally not built

Make this available as an optional section on the landing or completion screen.

Default collapsed.

Title:

```text
의도적으로 만들지 않은 것
```

Items:

```text
캘린더 그리드
추천 시간 Top 3
수동 시간 투표
다른 사람 일정 자동 이동
개인 일정 제목 공개
거절 사유 입력
부분 참석과 회의 요약
사람 검색과 조직도
```

Supporting copy:

```text
회의 시간을 찾는 기능 전체가 아니라,
여러 조건 사이에서 공정하게 한 시간을 결정하는 경험에 집중했습니다.
```

Do not frame this as missing work.

Frame it as scope decisions.

---

# 23. Fresh-session rules

Every review entry must create or reset the correct session.

## Core flow start

```text
new coordination-seed session
no response overrides
no active request
actor: organizer
```

## Ready shortcut

```text
new ready-seed session
no response overrides
actor: organizer
```

## Decline branch

```text
new coordination-seed session
real request/decline flow required
```

## Lab → product

```text
new session from current lab attendance types
no stale request
no stale override unless explicitly simulated and confirmed
```

Do not mutate the completed review session.

---

# 24. Review menu

The review chrome may open a small menu.

Allowed items:

```text
핵심 플로우 처음부터
바로 확정 가능한 경우
거절 후 재추천
조건 직접 바꿔보기
리뷰 랜딩
```

## Rules

- menu is secondary
- not always expanded
- selecting a branch creates a fresh session
- do not place the menu inside Decision Surface
- hide in user-test mode

---

# 25. User-test mode

Direct organizer route:

```text
/prototype/session/:sessionId/organizer?usertest=1
```

Direct attendee route:

```text
/prototype/session/:sessionId/respond/:requestId?usertest=1
```

Hide:

- review landing context
- review chrome
- design-note drawer
- actor-transition explanation
- branch shortcuts
- completion review navigation
- rule-lab links

The product must remain fully operable for the assigned actor.

---

# 26. Debug mode

Debug mode may show:

- session ID
- request ID
- recommendation status
- selected slot ID
- confirmation targets
- response overrides
- rule comparator vector

Only when:

```text
?debug=1
```

Do not combine debug UI with review notes.

Do not show it to the evaluator by default.

---

# 27. Visual language

## Review landing

- calm neutral background
- product preview visually stronger than explanatory cards
- one clear Primary CTA
- no decorative dashboard charts
- no illustration required
- align with product typography and spacing

## Review chrome

- low contrast
- no shadow-heavy floating bar
- smaller than product header
- clearly outside product surface

## Design-note drawer

- documentation tone
- no product Primary buttons
- clear sections
- readable but visually secondary

## Rule lab

- utility surface
- product components reused
- no developer-console appearance
- no raw JSON by default

---

# 28. Accessibility

Implement:

- landing heading hierarchy
- product preview labelled as preview
- review chrome in a separate navigation landmark
- design-note drawer focus trap and focus return
- actor-transition guidance clearly labelled as reviewer navigation
- rule-lab controls use the existing accessible segmented control
- no step meaning conveyed by color alone
- 200% text zoom
- keyboard completion of the review flow
- mobile drawer/bottom sheet keyboard support
- reduced-motion support
- live regions limited to product state changes, not reviewer prose

---

# 29. Suggested component structure

Adapt to the project.

```text
review/
  review-landing.tsx
  review-hero.tsx
  live-product-preview.tsx
  review-chrome.tsx
  review-menu.tsx
  design-note-drawer.tsx
  actor-transition-card.tsx
  review-completion.tsx
  omitted-scope-section.tsx

lab/
  rule-lab-screen.tsx
  rule-lab-controls.tsx
  rule-order-explanation.tsx
  lab-result-preview.tsx
```

Data/config:

```text
review/
  review.types.ts
  review-notes.ts
  review-routes.ts
  review-session.factory.ts
```

Do not import review components into domain-engine files.

---

# 30. Analytics hooks

No external analytics service is required.

Add lightweight event hooks or console-safe abstraction:

```ts
type ReviewEvent =
  | "review_landing_viewed"
  | "core_flow_started"
  | "design_note_opened"
  | "actor_transition_opened"
  | "core_flow_completed"
  | "ready_branch_started"
  | "decline_branch_started"
  | "rule_lab_opened"
  | "lab_condition_changed"
  | "lab_product_flow_started";
```

Purpose:

- verify review navigation
- identify broken flow steps during QA

Do not send personal data.

---

# 31. Tests

Use the existing Vitest and UI test setup.

## Landing tests

- `/` renders one Primary CTA
- Primary CTA creates a fresh coordination session
- lab action routes to `/lab`
- preview is calculated from the real engine
- no three equal scenario cards

## Review-mode tests

- review chrome visible with `review=1`
- hidden with `usertest=1`
- design-note drawer content changes by step
- product layout does not change when notes are closed
- actor-transition card uses current request/session ID

## Completion tests

- core connected flow routes to review completion
- ready shortcut creates a new session
- decline branch does not hardcode a next result
- `처음으로` returns to landing

## Rule-lab tests

- required/optional changes recompute through the real engine
- preset seeds set inputs only
- response simulation uses real overrides
- product-flow CTA creates a new session with lab inputs
- no raw private labels appear
- no enum labels appear by default

## Session tests

- every branch creates a fresh session
- completed session is not mutated by another branch
- stale request and overrides do not leak
- refresh restores the active review run

## Accessibility tests

- drawer focus management
- review navigation landmark
- keyboard access to branch menu
- 200% zoom does not clip landing or lab

---

# 32. Forbidden implementation decisions

Do not:

- keep a large explanation sidebar beside every product screen
- put design rationale inside the Decision Surface
- show all scenarios as equal Primary cards
- make the reviewer read a long case study before starting
- change product copy only in review mode
- use review notes to compensate for unclear product UI
- expose debug scores in review mode
- use hardcoded branch results
- reuse stale session state
- add fake research numbers or performance metrics
- claim that the recommendation is perfectly fair
- show Toss evaluation criteria as a checklist to the reviewer

---

# 33. Acceptance criteria

## First impression

- reviewer understands problem and solution within 10 seconds
- only one Primary review flow is prominent
- expected duration is visible
- live product preview proves the claim

## Product integrity

- product remains full-width and self-contained
- no permanent explanatory sidebar
- review notes are optional
- user-test mode contains product only

## Thought process visibility

The reviewer can discover:

- root problem
- decision priority
- privacy boundary
- consent policy
- rejected alternatives
- intentionally omitted scope

without reading a long document.

## System verification

- rule lab uses the same engine
- required/optional changes produce dynamic results
- approval/decline simulations recompute
- no scenario-result hardcoding returns

## Quality

- review landing works at 1440px and 390px
- review chrome does not compete with product CTA
- design-note drawer is accessible
- fresh sessions work
- TypeScript passes
- lint passes
- tests pass
- build passes

---

# 34. Visual QA deliverables

After implementation, provide screenshots for:

1. review landing desktop
2. review landing mobile
3. live product preview
4. product with review chrome
5. design-note drawer — attendance conditions
6. design-note drawer — confirmation request
7. actor transition to attendee
8. actor transition back to organizer
9. review completion
10. rule lab default
11. rule lab after role changes
12. rule lab NO_OPTION
13. user-test mode without review UI
14. 200% text zoom

Provide a short recording:

```text
Landing
→ core flow
→ attendee transition
→ organizer result
→ review completion
```

And:

```text
Rule lab
→ change required/optional
→ calculate new result
→ open as product flow
```

---

# 35. Report after implementation

Return:

1. review information architecture
2. route structure
3. fresh-session strategy
4. landing component structure
5. live preview engine mapping
6. review chrome behavior
7. design-note mapping
8. actor-transition behavior
9. review completion branches
10. rule-lab architecture
11. review/user-test/debug mode separation
12. files created
13. files modified
14. test results
15. TypeScript / lint / build results
16. any requirement not implemented

---

# 36. Final instruction

The review experience must make the evaluator think:

```text
I understand the problem.
I know which flow to try.
The product works without explanation.
I can inspect the design reasoning when I need it.
I can change the conditions and verify that the rules are real.
```

Do not make the evaluator assemble the story from disconnected scenario buttons.

Do not make the product depend on a permanent explanation panel.

Use the landing to frame the problem, the product to prove the solution, and the rule lab to prove the system.
