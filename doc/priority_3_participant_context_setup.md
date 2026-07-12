# Priority 3 — Participant Context & Attendance Setup Redesign

> Cursor implementation request  
> Scope: **Participant setup, public context visibility, role controls, and privacy-safe mapping**  
> Prerequisites:
> - Priority 1 dynamic decision engine is implemented.
> - Priority 2 Decision Surface is implemented or its data contract is fixed.

---

## 0. Goal

Redesign the participant setup so the organizer can understand:

1. who is required and who is optional
2. which public scheduling context matters for each person
3. how changing required/optional roles changes the decision input
4. which information is intentionally hidden for privacy

The screen must not feel like a static scenario selector.

It must behave like a real product input surface connected to the decision engine.

### Product principle

```text
Show the scheduling context needed for a fair decision.
Do not expose private calendar details.
Keep people in stable positions while their roles change.
```

---

# 1. Why this patch is necessary

The current participant screen shows:

- name
- role
- required/optional control

But it does not sufficiently show:

- who frequently works offsite
- who avoids meetings immediately after lunch
- who has protected time
- who has a known customer-response block
- why changing a person from optional to required may change the result

As a result, the organizer changes role controls without understanding the decision context.

The redesigned setup must begin the experience of understanding coworkers' situations before the recommendation screen.

---

# 2. Scope

## Implement in this patch

- one stable participant list
- required/optional control for 5 non-organizer participants
- locked organizer row
- public context summary per participant
- dynamic required/optional count summary
- optional count zero handling
- privacy-safe context mapper
- engine input wiring
- responsive desktop/mobile setup
- accessibility and keyboard control
- tests for role changes and privacy labels

## Do not implement in this patch

- people search
- recent meeting participants
- organization directory
- contact picker
- adding or removing participants
- full calendar preview
- recommendation cards
- review landing redesign
- attendee mobile response redesign
- AI-generated context
- free-form preference editing
- detailed calendar-event inspection

The six participants are already known from the prior work context.

---

# 3. Product assumption

The user entered from an existing six-person work context, such as:

- project channel
- group conversation
- existing work item
- previous meeting context

Therefore the product does not need to ask the organizer to search for people again.

This patch begins with six known participants and asks only for the decision-relevant input:

```text
Who must attend?
Who is optional?
What public scheduling context should the organizer understand?
```

---

# 4. Screen purpose

## Current setup screen purpose

Not:

```text
Select people to invite.
```

Required:

```text
Confirm the attendance conditions for six already-selected coworkers.
```

## Required copy

### Title

```text
참석 조건을 확인해주세요
```

### Description

```text
필수 참석자가 모두 가능한 시간을 우선해서 찾을게요.
```

### Context meta

```text
다음 주 · 1시간 · 6명
```

### Count summary

Dynamic:

```text
필수 4명 · 선택 2명
```

If optional count is zero:

```text
필수 6명 · 선택 없음
```

### Primary CTA

```text
이 조건으로 시간 찾기
```

---

# 5. Participant ordering

Use a single list.

The row order must never change when attendance type changes.

Required order:

```text
1. 김민지
2. 이지훈
3. 박서연
4. 최도윤
5. 정유진
6. 한현우
```

Do not split into separate required and optional cards.

Do not move a row between groups.

This prevents spatial-memory loss and avoids an empty optional section.

---

# 6. Organizer rule

## Organizer

```text
김민지
PO
주최자 · 필수 참석
```

Rules:

- required
- locked
- cannot be changed to optional
- do not render a disabled segmented control that looks broken
- render a clear static status label instead

Recommended UI:

```text
김민지
PO
주최자 · 필수 참석
```

Optional small lock icon is allowed but not required.

Accessible label:

```text
김민지, PO, 주최자, 필수 참석자, 변경할 수 없음
```

---

# 7. Participant context model

Use public, abstracted context only.

Recommended type:

```ts
export type PublicSchedulingContextKind =
  | "protected-time"
  | "lunch-preference"
  | "offsite"
  | "customer-response"
  | "meeting-density"
  | "none";

export type PublicSchedulingContext = {
  kind: PublicSchedulingContextKind;
  shortLabel: string;
  supportingLabel?: string;
};
```

Recommended participant values:

```ts
const publicContextsByParticipant = {
  minji: {
    kind: "none",
    shortLabel: "주최자 · 필수 참석",
  },
  jihoon: {
    kind: "protected-time",
    shortLabel: "개인 보호 시간 있음",
  },
  seoyeon: {
    kind: "lunch-preference",
    shortLabel: "점심 직후 회피",
  },
  doyoon: {
    kind: "offsite",
    shortLabel: "화·목 외근",
  },
  yujin: {
    kind: "none",
    shortLabel: "공유된 추가 조건 없음",
  },
  hyunwoo: {
    kind: "customer-response",
    shortLabel: "수요일 오후 고객 대응",
  },
} satisfies Record<string, PublicSchedulingContext>;
```

Do not derive public context directly from raw event titles in JSX.

Use a privacy-safe mapper.

---

# 8. Privacy-safe mapping

Create a pure mapping layer.

```ts
export function mapPrivateScheduleToPublicContext(
  source: InternalScheduleContext
): PublicSchedulingContext
```

## Allowed labels

```text
개인 보호 시간 있음
점심 직후 회피
화·목 외근
외근 이후 이동
수요일 오후 고객 대응
연속 회의가 많은 시간
공유된 추가 조건 없음
```

## Forbidden labels

Never show:

```text
병원 진료
가족 일정
개인 약속
상담
고객사 실명
프로젝트 코드명
개인 일정 제목
거절 사유
```

## Required fallback

If an internal context cannot be safely mapped:

```text
일정 있음
```

or:

```text
공유된 추가 조건 있음
```

Never leak the original string.

---

# 9. Participant row structure

## Desktop

```text
ParticipantRow
├── Identity
│   ├── Name
│   └── Role
├── PublicContext
└── AttendanceControl
```

Recommended layout:

```css
grid-template-columns: minmax(150px, 1fr) minmax(180px, 1fr) auto;
gap: 20px;
align-items: center;
```

Example:

```text
이지훈
백엔드 개발자        개인 보호 시간 있음      [필수 | 선택]
```

## Mobile

Stack identity and context:

```text
이지훈                         [필수 | 선택]
백엔드 개발자
개인 보호 시간 있음
```

Do not truncate meaningful context if the screen can wrap naturally.

Use `word-break: keep-all`.

---

# 10. Attendance control

Use a segmented control.

```text
[ 필수 | 선택 ]
```

## States

- required active
- optional active
- hover
- pressed
- focus
- disabled is not used for non-organizers

## Semantics

Use radio-group semantics.

Example:

```tsx
<div role="radiogroup" aria-label="이지훈 참석 조건">
  <button role="radio" aria-checked={isRequired}>필수</button>
  <button role="radio" aria-checked={!isRequired}>선택</button>
</div>
```

A native radio implementation is also acceptable.

## Visual behavior

Active:

- subtle primary background
- primary or dark text
- clear selected surface

Inactive:

- neutral background
- secondary text
- still readable and clickable

Do not use red/green to distinguish required and optional.

Do not animate row movement.

Only the active segment changes.

---

# 11. Context presentation

Public context is important but secondary to identity and attendance type.

Recommended treatment:

- one short line
- 13–14px
- secondary text
- optional small neutral icon
- no bright chips for every person

Avoid turning all contexts into colored pills.

Allowed subtle icon mapping:

```text
protected-time      shield or lock
lunch-preference    clock
offsite             briefcase or location-neutral work icon
customer-response   headset or message
meeting-density     stacked calendar
none                no icon
```

Icons support text; they do not replace it.

---

# 12. Dynamic count summary

The summary must update immediately when controls change.

```ts
type AttendanceSummary = {
  requiredCount: number;
  optionalCount: number;
};
```

Organizer is included in `requiredCount`.

Examples:

```text
필수 4명 · 선택 2명
필수 5명 · 선택 1명
필수 6명 · 선택 없음
필수 1명 · 선택 5명
```

Do not display:

```text
선택 0명
```

Use:

```text
선택 없음
```

Announce summary changes with a small `aria-live="polite"` region.

Do not announce the entire list again.

---

# 13. Connection to the decision engine

On attendance change:

1. update local attendance-type state
2. update count summary
3. do not navigate
4. do not reorder rows
5. do not calculate and display a final recommendation yet unless current architecture already supports an unobtrusive preview

On Primary CTA:

1. read current attendance types
2. clear previous request state
3. clear prior response overrides
4. call Priority 1 `recommendMeeting`
5. route based on calculated engine result
6. pass full `participantImpacts` to Priority 2 Decision Surface

Do not use a static scenario result.

---

# 14. Optional live preview

This is optional, not required.

If implemented, keep it minimal.

Allowed:

```text
현재 조건에서는 추가 확인이 필요할 수 있어요.
```

or:

```text
현재 조건에서는 바로 확정 가능한 시간이 있어요.
```

Only show this if it is calculated from the real engine.

Do not show:

- final time before user requests it
- Top 3 candidates
- raw scores
- full reason list
- unstable predictions

If unsure, omit live preview.

---

# 15. Public context and role interaction

The UI should help the organizer understand why role choice matters.

Examples:

## 이지훈

```text
개인 보호 시간 있음
```

If required:

- protected conflict can create a confirmation request

If optional:

- protected conflict does not block the meeting

## 박서연

```text
점심 직후 회피
```

If required:

- preference penalty receives higher ranking priority

If optional:

- preference remains considered but cannot block confirmation

## 최도윤

```text
화·목 외근
```

If required:

- hard offsite conflicts invalidate those slots

If optional:

- those slots may still be recommended if required attendees are satisfied

Do not explain all of this in long text inside each row.

The actual effect should become visible in the Decision Surface after calculation.

---

# 16. Information hierarchy

Required hierarchy:

1. screen title
2. purpose description
3. dynamic count summary
4. participant list
5. Primary CTA
6. optional small scenario/debug metadata

Do not place `대표 시나리오 데이터` in the main visual hierarchy.

If developer metadata is needed, show only in `?debug=1`.

---

# 17. Remove scenario language from product UI

Remove from default product UI:

```text
대표 시나리오 데이터 · 조율 필요
대표 시나리오 데이터 · 바로 확정
대표 시나리오 데이터 · 거절 후 재추천
```

These labels make the product feel like a static prototype.

If needed for QA:

```text
?debug=1
```

Then show a small developer-only panel outside the product surface.

The user-facing screen should behave as one product.

---

# 18. Empty and edge states

## Optional count zero

Do not render an empty optional group.

Single list remains unchanged.

Summary:

```text
필수 6명 · 선택 없음
```

## Only organizer required

Summary:

```text
필수 1명 · 선택 5명
```

CTA remains enabled.

The engine chooses a time that maximizes optional attendance after satisfying the organizer.

## All six required

Summary:

```text
필수 6명 · 선택 없음
```

The engine may return:

- READY
- NEED_CONFIRMATION
- NO_OPTION

Do not block this configuration.

## Unknown context

Display:

```text
공유된 추가 조건 없음
```

or omit the context line if visual noise becomes high.

Do not show `undefined`, `없음`, or raw data keys.

---

# 19. Visual specifications

## Page

```text
Content width: 640px desktop
Maximum width: 720px
Horizontal padding: 24–32px
```

The setup screen can remain narrower than Priority 2 Decision Surface.

## List surface

```text
Background: white
Radius: 24px
Padding: 8px 20px
Border: optional 1px #E5E8EB
Shadow: subtle
```

## Row

```text
Desktop minimum height: 68px
Mobile minimum height: 76px
Vertical padding: 14px
Divider: #E5E8EB
```

## Primary CTA

```text
Height: 52px desktop
Height: 56px mobile
Width: 100%
```

## Spacing

```text
Title → description        8px
Description → context      12px
Context → count summary    24px
Count summary → list       16px
List → Primary CTA         24px
```

---

# 20. Copy rules

Use concise product language.

## Title

```text
참석 조건을 확인해주세요
```

## Description

```text
필수 참석자가 모두 가능한 시간을 우선해서 찾을게요.
```

## Context explanation

Do not add another long paragraph.

If a brief helper is required:

```text
동료가 공유한 일정 조건만 보여드려요.
```

This may link to a small tooltip:

```text
개인 일정의 제목과 사유는 공개되지 않아요.
```

Do not show privacy policy text in every row.

---

# 21. Optional privacy tooltip

Add one unobtrusive info control near the participant-list heading.

Label:

```text
공유되는 일정 정보
```

Content:

```text
외근이나 선호 시간처럼 회의 조율에 필요한 정보만 보여드려요.
개인 일정의 제목과 사유는 공개되지 않아요.
```

Rules:

- tooltip/popover
- no modal if avoidable
- keyboard accessible
- not required to proceed
- do not repeat on every screen

---

# 22. Interaction

## Role change

- immediate visual response
- 120–160ms segment transition
- no row movement
- no list-height jump
- count summary updates in place

## CTA

- loading state after click
- prevent duplicate execution
- transition to analysis state
- engine result determines next screen

## Keyboard

Within each segmented control:

- Tab enters the group
- Arrow keys may change required/optional
- Space/Enter selects
- focus ring visible

---

# 23. Accessibility

Implement:

- list semantics
- radio-group semantics for attendance controls
- static organizer status announced clearly
- dynamic count summary in narrow live region
- public-context icons decorative unless interactive
- 44px minimum target
- visible focus ring
- 200% text zoom without clipping
- `word-break: keep-all`
- no role differentiation by color alone
- privacy tooltip accessible by keyboard and screen reader

Screen-reader example:

```text
이지훈, 백엔드 개발자, 개인 보호 시간 있음, 필수 참석자로 설정됨
```

---

# 24. Suggested component structure

Adapt to the current project.

```text
participant-setup/
  participant-setup-screen.tsx
  attendance-summary.tsx
  participant-condition-list.tsx
  participant-condition-row.tsx
  attendance-type-control.tsx
  public-context-label.tsx
  scheduling-privacy-popover.tsx
```

Data mapping:

```text
view-model/
  participant-setup.mapper.ts
```

Privacy mapping:

```text
privacy/
  public-scheduling-context.mapper.ts
```

---

# 25. Suggested view model

```ts
export type ParticipantSetupRowViewModel = {
  id: string;
  name: string;
  role: string;
  isOrganizer: boolean;
  attendanceType: AttendanceType;
  attendanceLocked: boolean;
  publicContext?: {
    label: string;
    icon?: PublicSchedulingContextKind;
  };
};

export type ParticipantSetupViewModel = {
  requiredCount: number;
  optionalCount: number;
  summaryLabel: string;
  rows: ParticipantSetupRowViewModel[];
};
```

Create one mapper:

```ts
export function mapParticipantsToSetupViewModel(params: {
  participants: Participant[];
  attendanceTypes: Record<string, AttendanceType>;
}): ParticipantSetupViewModel
```

Do not create UI labels in multiple JSX branches.

---

# 26. Tests

Use existing test tooling.

## Unit tests

Test the view-model mapper:

- organizer is locked required
- row order never changes
- required count includes organizer
- optional zero becomes `선택 없음`
- all optional except organizer becomes `필수 1명 · 선택 5명`
- unknown private label maps to safe fallback
- forbidden private labels never appear

## Interaction tests

- toggling 이지훈 changes summary count
- row position remains unchanged
- toggling does not navigate
- CTA sends current attendance types to engine
- CTA clears prior response overrides
- all six required is allowed
- only organizer required is allowed

## Privacy regression tests

Given internal labels:

```text
병원 진료
가족 일정
개인 상담
```

Rendered output must not contain those strings.

Expected safe label:

```text
일정 있음
```

or:

```text
공유된 추가 조건 있음
```

---

# 27. Forbidden implementation decisions

Do not:

- split required and optional participants into separate cards
- move rows when role changes
- add people search
- add recent contacts
- add organization chart
- show private event titles
- show reason for protected time
- use scenario labels in default product UI
- disable all-optional-except-organizer configuration
- require at least two required attendees
- hardcode next-screen result
- add animated row sorting
- use large colored badges for every context
- create a full calendar preview

---

# 28. Acceptance criteria

The patch passes when:

- six participants appear in one stable list
- organizer is visibly and semantically locked as required
- other five participants can switch required/optional
- no row changes position
- count summary updates immediately
- optional zero leaves no empty section
- all 32 role combinations remain possible
- public context is visible for relevant coworkers
- private schedule titles are never exposed
- CTA sends current input to Priority 1 engine
- result is not determined by scenario ID
- setup screen works at desktop and mobile widths
- keyboard interaction works
- 200% text zoom works
- TypeScript passes
- lint passes
- tests pass
- build passes

---

# 29. Visual QA screenshots

After implementation, provide:

1. default setup: 필수 4명 · 선택 2명
2. all six required
3. only organizer required
4. one role-control focus state
5. privacy tooltip open
6. mobile setup
7. setup immediately before engine calculation

---

# 30. Report after implementation

Return:

1. previous setup architecture
2. new stable-list architecture
3. files created
4. files modified
5. public-context mapping rules
6. private-label protection
7. engine input wiring
8. interaction-test results
9. accessibility implementation
10. TypeScript / lint / test / build results
11. any unimplemented requirement

---

# 31. Final instruction

This patch must make the organizer understand coworkers' scheduling conditions without exposing their private calendars.

The setup screen should answer:

```text
Who must attend?
Who is optional?
What scheduling context matters for each person?
What will the engine use as decision input?
```

Do not turn the screen into a people picker.

Do not turn it into a calendar.

Make it a clear attendance-condition editor connected to the real decision engine.
