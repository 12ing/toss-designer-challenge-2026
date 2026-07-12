# Priority 2 — Decision Surface Redesign Patch

> Cursor implementation request  
> Scope: **Organizer result experience only**  
> Prerequisite: Priority 1 dynamic decision engine must already be implemented and tested.

---

## 0. Goal

Replace the current narrow, center-aligned result card with one reusable **Decision Surface** that shows:

1. the recommended date and time
2. the current decision state
3. the meeting impact on all 6 participants
4. the one next action
5. the reason for the recommendation, on demand

The product must not force the organizer to inspect six calendars.

However, it must let the organizer understand how the proposed time affects the six people.

### Product principle

```text
Decision first.
Context available.
Private details protected.
```

Do not show raw calendar grids or private event titles.

Show the compressed impact of the decision.

---

# 1. Why this patch is necessary

The current result UI is too close to a generic recommendation card.

It tells the organizer:

- one time
- total required/optional counts
- one confirmation target

But it does not sufficiently reveal:

- who is available
- whose preference was respected
- whose travel burden was avoided
- who cannot attend as optional
- why only one person needs confirmation
- why this time requires less coordination than another time

This weakens the challenge requirement that the organizer should understand coworkers' situations.

The redesign must make the system's reasoning visible through **person-level impact**, not through long explanatory copy.

---

# 2. Scope

## Implement in this patch

- shared `DecisionSurface`
- person-level impact list for all six participants
- desktop two-column layout
- mobile stacked layout
- state variants:
  - `READY`
  - `NEED_CONFIRMATION`
  - `WAITING`
  - `READY_AFTER_CONFIRMATION`
  - `NEXT_ALTERNATIVE`
  - `NO_OPTION`
- recommendation reason disclosure
- state transitions that preserve the same surface
- calculated values from Priority 1 engine

## Do not implement in this patch

- review landing redesign
- participant setup redesign
- attendee mobile response redesign
- scenario lab
- people search
- organization directory
- calendar grid
- Top 3 recommendations
- full meeting creation form redesign
- global design-system replacement

---

# 3. Before implementation

Inspect and report:

1. current result-card component tree
2. current engine output from Priority 1
3. where result strings are still hardcoded
4. current responsive layout approach
5. reusable card, button, disclosure, icon, and typography primitives
6. files to create
7. files to modify

Then implement.

Do not begin by creating a second parallel result component.

Replace the current result component with the shared surface.

---

# 4. Core information hierarchy

Every result state must follow this hierarchy:

1. proposed time
2. current decision state
3. required-attendee impact
4. primary action
5. six-person impact summary
6. recommendation reason
7. secondary action

The person-impact panel is important, but it must not visually overpower the proposed time.

---

# 5. Desktop layout

## Reference viewport

```text
1440 × 900
```

## Main content

```text
Maximum surface width: 880px
Minimum useful width: 760px
Page horizontal padding: 32px
Surface outer padding: 32px
Surface radius: 24px
```

## Two-column structure

```text
DecisionSurface
├── DecisionColumn        1fr
└── PeopleImpactColumn    320px
```

Recommended grid:

```css
grid-template-columns: minmax(0, 1fr) 320px;
gap: 32px;
```

Do not create two independent cards.

Both columns must visually belong to one Decision Surface.

A subtle divider between columns is allowed.

---

# 6. Mobile layout

At narrow widths:

```text
Decision summary
↓
Primary action
↓
People impact summary
↓
Reason disclosure
```

## Breakpoint

Use the current project breakpoint system.

If none exists:

```text
< 720px → stacked layout
```

## Mobile behavior

- full participant list may be shown inline if readable
- or collapsed behind `6명 상황 보기`
- do not hide required confirmation information
- do not open a full-screen calendar
- primary action remains visible before optional details

Recommended collapsed mobile summary:

```text
필수 4명 모두 가능 · 선택 1명 가능
6명 상황 보기
```

When expanded, show six impact rows.

---

# 7. Shared component architecture

```ts
export type DecisionSurfaceMode =
  | "ready"
  | "need-confirmation"
  | "waiting"
  | "ready-after-confirmation"
  | "next-alternative"
  | "no-option";

export type DecisionSurfaceProps = {
  mode: DecisionSurfaceMode;
  recommendation: MeetingRecommendation;
  previousRecommendation?: {
    dateLabel: string;
    timeLabel: string;
  };
  isReasonExpanded: boolean;
  onPrimaryAction?: () => void;
  onToggleReason?: () => void;
  onChangeConditions?: () => void;
};
```

Recommended structure:

```text
DecisionSurface
├── DecisionHeader
│   ├── ContextMeta
│   ├── Date
│   ├── Time
│   └── StateMessage
├── DecisionSummary
│   ├── RequiredSummary
│   ├── OptionalSummary?
│   └── ConfirmationSummary?
├── PrimaryAction?
├── SupportingMessage?
├── PeopleImpactPanel
│   ├── PanelTitle
│   └── ParticipantImpactRow × 6
├── ReasonDisclosure?
│   └── ReasonRows
└── SecondaryAction?
```

Do not create a unique markup tree for every state.

Use the same structural regions and change content by mode.

---

# 8. Decision Surface visual shell

## Surface

```text
Background: #FFFFFF
Radius: 24px
Padding: 32px
Shadow: subtle only
Border: optional 1px #E5E8EB
```

Recommended shadow:

```css
box-shadow: 0 12px 32px rgba(0, 27, 55, 0.06);
```

Avoid a floating dashboard-widget appearance.

## Internal divider

Between decision and people columns:

```text
1px solid #E5E8EB
```

On mobile, use a horizontal divider.

---

# 9. Typography

Use current project font.

## Desktop

```text
Context meta       13 / 20 / 500
Date               18 / 26 / 600
Time               38 / 48 / 700
State message      17 / 26 / 600
Summary label      15 / 23 / 500
Summary value      16 / 24 / 600
Panel title        15 / 23 / 700
Person name        15 / 22 / 600
Person metadata    13 / 20 / 400
Impact label       13 / 20 / 600
Reason label       14 / 21 / 500
Reason value       15 / 23 / 500
```

## Mobile

```text
Time               30 / 40 / 700
Date               17 / 25 / 600
State message      17 / 26 / 600
Person name        15 / 22 / 600
Impact label       13 / 20 / 600
```

The time must remain visually strongest.

---

# 10. Person impact model

Use `participantImpacts` returned by the Priority 1 engine.

```ts
type ParticipantImpactStatus =
  | "required-available"
  | "required-confirmation"
  | "required-available-with-note"
  | "optional-available"
  | "optional-unavailable"
  | "optional-available-with-note";
```

Recommended UI model:

```ts
type ParticipantImpactViewModel = {
  participantId: string;
  name: string;
  roleLabel: "필수" | "선택";
  statusLabel:
    | "가능"
    | "확인 필요"
    | "선호 반영"
    | "외근 회피"
    | "외근 이후 가능"
    | "참석 어려움";
  contextLabel?: string;
  tone: "positive" | "neutral" | "attention";
};
```

The UI must derive this from engine output.

Do not hardcode people rows per scenario.

---

# 11. Participant impact row

## Structure

```text
[Name + role]              [Status]
[Optional public context]
```

Example:

```text
김민지 · 필수                 가능
```

```text
이지훈 · 필수                 확인 필요
개인 보호 시간
```

```text
박서연 · 필수                 선호 반영
점심 직후 회피
```

```text
최도윤 · 필수                 외근 회피
화·목 외근
```

```text
정유진 · 선택                 가능
```

```text
한현우 · 선택                 참석 어려움
고객 대응
```

## Row rules

```text
Minimum height: 52px
Vertical padding: 12px
Divider between rows
No avatar required
```

Avoid six colored avatars.

This is information design, not a people directory.

## Role label

Use compact text:

```text
필수
선택
```

Do not use bright badges for every row.

Role can be secondary inline metadata.

---

# 12. Impact tones

## Positive

Use for:

- required available
- optional available
- ready after confirmation

Do not make every positive row green.

Recommended:

- dark primary text
- optional small check icon
- subtle positive icon background only

## Neutral

Use for:

- preference respected
- travel avoided
- optional unavailable
- available with note

Optional unavailability is not an error.

## Attention

Use for:

- required confirmation needed

Use primary blue or neutral emphasis.

Do not use warning red or orange.

---

# 13. State — READY

## Required content

```text
Context:
다음 주 · 1시간 · 6명

Date:
{evaluation.slot.dateLabel}

Time:
{evaluation.slot.timeLabel}

State:
바로 확정할 수 있어요.

Summary:
필수 {requiredTotal}명 모두 가능
선택 {optionalTotal}명 중 {optionalAvailable}명 가능

Primary CTA:
이 시간으로 확정

People panel title:
이 시간에 6명은

Disclosure:
이 시간인 이유
```

## Desktop composition

```text
LEFT
- context
- date
- time
- state
- attendance summary
- primary CTA
- disclosure

RIGHT
- six person impacts
```

## Rules

- optional unavailable person must remain visible
- do not display only aggregate counts
- do not expose private event titles
- do not show multiple candidate times

---

# 14. State — NEED_CONFIRMATION

## Required content

```text
Context:
다음 주 · 1시간 · 6명

Date:
{evaluation.slot.dateLabel}

Time:
{evaluation.slot.timeLabel}

State:
확인 한 번이면 필수 참석자 모두 가능해요.

Confirmation summary:
개인 보호 시간 {confirmationCount}건과 겹쳐요.

Primary CTA:
가능 여부 묻기

People panel title:
이 시간에 6명은

Disclosure:
왜 이 시간이 조율이 가장 적나요?
```

## Person panel requirement

The confirmation target must be visible in the people list:

```text
이지훈 · 필수          확인 필요
개인 보호 시간
```

The other five people must also be visible.

This answers:

- why this person needs confirmation
- why the others do not
- how the whole group is affected

## Multiple confirmation targets

If the engine returns more than one:

```text
확인 2번이면 필수 참석자가 모두 가능해요.
```

Show all targets as `확인 필요`.

The current UI may still request them sequentially.

Do not pretend there is only one target.

---

# 15. State — WAITING

## Required content

```text
Date:
{selected slot date}

Time:
{selected slot time}

State:
응답을 기다리고 있어요.

Supporting:
확인되면 회의를 확정할 수 있는지 알려드릴게요.

People panel:
- approved/available people remain visible
- pending person shows `응답 대기`
- optional people remain visible
```

Example:

```text
이지훈 · 필수          응답 대기
개인 보호 시간
```

## Primary action

None.

Do not show:

- resend
- countdown
- 5/6 progress
- pressure copy
- request cancel in this patch

Review navigation is handled outside the product surface.

---

# 16. State — READY_AFTER_CONFIRMATION

## Required content

```text
State:
이제 확정할 수 있어요.

Summary:
필수 {requiredTotal}명 모두 가능
선택 {optionalTotal}명 중 {optionalAvailable}명 가능

Primary CTA:
이 시간으로 확정
```

## People panel

The approved target becomes:

```text
이지훈 · 필수          가능
```

Do not show:

- 양보함
- 승인해줌
- 덕분에 가능
- 희생

The person's private response is not publicized as a concession.

---

# 17. State — NEXT_ALTERNATIVE

This is a presentation mode, not a separate engine result.

Use when a previous request was declined and the engine returned a new recommendation.

## Required content

```text
State:
다음으로 조율이 적은 시간을 찾았어요.

Date:
{new slot date}

Time:
{new slot time}

Supporting:
이전 시간은 일정 확인이 어려워 제외했어요.
```

If the new result requires confirmation:

```text
Primary CTA:
가능 여부 묻기
```

If the new result is ready:

```text
Primary CTA:
이 시간으로 확정
```

## People panel

Show all six impacts for the new time.

Do not show the previous attendee's decline reason.

---

# 18. State — NO_OPTION

## Goal

Do not invent a recommendation.

## Required content

```text
State:
현재 조건으로는 다음 주 안에
모두가 가능한 1시간을 찾기 어려워요.

Supporting:
필수 참석자나 가능한 조건을 다시 확인해주세요.

Primary CTA:
참석 조건 다시 보기
```

## People panel

Do not show a fake recommended time.

Instead show a compact blocking summary.

Example:

```text
현재 조건에서 막히는 이유

필수 일정 충돌         3개 시간
외근과 겹침            2개 시간
확인 가능한 보호 시간  없음
```

This blocking summary must be calculated from engine evaluations.

Do not reveal private event titles.

---

# 19. Reason disclosure

## Closed labels

### READY

```text
이 시간인 이유
```

### NEED_CONFIRMATION / NEXT_ALTERNATIVE

```text
왜 이 시간이 조율이 가장 적나요?
```

## Open label

```text
이유 숨기기
```

## Layout

Use a definition-list layout.

```text
필수 참석자       4명 모두 가능
확인 필요         개인 보호 시간 1건
이동 일정         외근 일정과 직접 충돌 없음
개인 선호         점심 직후 회피 반영
선택 참석자       2명 모두 가능
다른 시간         2건 이상의 확인 또는 필수 충돌
```

## Data mapping

Use engine `reasonRows`.

Do not hardcode reasons by mode.

## Rules

- no numeric weighted score
- no raw comparator vector
- no private calendar title
- no full alternative ranking
- no long algorithm essay

Maximum supporting explanation:

```text
필수 참석 가능 여부를 먼저 확인한 뒤,
추가 조율이 적은 순서로 비교했어요.
```

---

# 20. Decision summary rules

## Required count

Show only when required total is greater than 0.

Organizer is always required, so this should exist.

## Optional count

If optional total is zero:

Do not show:

```text
선택 0명 중 0명 가능
```

Show only:

```text
필수 6명 모두 가능
```

## Confirmation count

If more than one:

```text
확인 2건 필요
```

Do not use a singular sentence.

---

# 21. Interaction behavior

## Initial appearance

Only animate the surface on first entry.

```text
opacity: 0 → 1
translateY: 8px → 0
duration: 240ms
```

## State change

Do not reanimate the entire surface.

Keep stable:

- outer surface
- date/time area
- people panel location

Animate only changed regions:

- state message
- confirmation summary
- primary action
- individual impact labels

Use:

```text
opacity + subtle size transition
160–240ms
```

## Person-row update

When a status changes:

```text
확인 필요 → 응답 대기 → 가능
```

Change the status label in place.

Do not remove and reinsert the row.

## Reason expansion

- expand inside the same surface
- no modal
- no route change
- preserve time and CTA
- `aria-expanded`
- restore focus when collapsed

---

# 22. Context privacy rules

Allowed UI context:

- 개인 보호 시간
- 점심 직후 회피
- 외근
- 외근 이후 이동
- 고객 대응
- 연속 회의
- 일정 있음

Forbidden UI context:

- 병원 진료
- 개인 사유
- project/customer names not needed for scheduling
- private calendar title
- decline reason
- relative importance inferred from event titles

If engine data contains detailed labels, map them to public abstract labels before rendering.

---

# 23. Accessibility

Implement:

- semantic heading hierarchy
- person-impact list as `ul` or meaningful list structure
- state changes announced only in a small `aria-live="polite"` region
- do not set the entire surface as live
- disclosure uses `aria-expanded` and `aria-controls`
- keyboard-accessible primary and secondary actions
- text zoom to 200% without clipping
- no fixed-height surface
- mobile touch targets at least 44px
- status is understandable without color
- decorative icons are `aria-hidden`

Screen-reader row example:

```text
이지훈, 필수 참석자, 확인 필요, 개인 보호 시간
```

---

# 24. Suggested components

Adapt to the current architecture.

```text
components/
  decision-surface.tsx
  decision-header.tsx
  decision-summary.tsx
  people-impact-panel.tsx
  participant-impact-row.tsx
  recommendation-reasons.tsx
  no-option-summary.tsx
```

Keep data mapping separate:

```text
view-model/
  decision-surface.mapper.ts
```

The mapper converts engine outputs into UI-safe labels.

---

# 25. Suggested mapper

```ts
export function mapRecommendationToDecisionSurface(
  recommendation: MeetingRecommendation,
  participants: Participant[],
  attendanceTypes: Record<string, AttendanceType>
): DecisionSurfaceViewModel
```

Return:

```ts
type DecisionSurfaceViewModel = {
  mode: DecisionSurfaceMode;
  dateLabel?: string;
  timeLabel?: string;
  stateLabel: string;

  summaryRows: Array<{
    label: string;
    value: string;
  }>;

  participantRows: ParticipantImpactViewModel[];

  confirmationCount: number;
  reasonRows: Array<{
    label: string;
    value: string;
  }>;

  primaryAction?: {
    label: string;
    action: "confirm" | "request" | "edit-conditions";
  };

  supportingLabel?: string;
};
```

All user-facing copy should be generated here or in a dedicated copy function.

Avoid scattered conditional strings across JSX.

---

# 26. Forbidden implementation decisions

Do not:

- keep the old narrow DecisionCard and place a second people card beside it
- create a dashboard
- use six avatars as the main information structure
- expose raw schedule titles
- show multiple recommended times
- add score bars
- add percentages
- color optional unavailable as an error
- frame a confirmation target as the cause of delay
- remount participant rows during status change
- add confirmation-pressure copy
- create separate unrelated layouts for every state
- hardcode people impacts per scenario
- redesign the review landing in this patch

---

# 27. Acceptance criteria

## Shared structure

- one `DecisionSurface` handles every organizer result state
- desktop shows decision and six-person impact in one surface
- mobile preserves the same information in a stacked structure
- all values come from Priority 1 engine output

## Understanding coworkers

- organizer can see all six people at the recommended time
- required and optional roles are identifiable
- confirmation target is identifiable
- optional unavailability is visible but not treated as failure
- public preference/travel context is visible where relevant
- private event details are not visible

## READY

- time is visually strongest
- all six impacts are visible
- one primary confirm action
- optional unavailable participant remains visible

## NEED_CONFIRMATION

- all six impacts are visible
- target person appears as `확인 필요`
- other five statuses explain why only this confirmation is needed
- one primary request action
- no error treatment

## WAITING

- pending person changes to `응답 대기`
- other rows remain stable
- no primary product action
- no countdown or resend

## READY_AFTER_CONFIRMATION

- target row changes to `가능`
- no public sacrifice framing
- confirm action returns

## NEXT_ALTERNATIVE

- new time appears first
- all six impacts recalculate
- prior decline reason is hidden

## NO_OPTION

- no fake time is shown
- blocking summary is calculated
- user gets one clear action to revise conditions

## Quality

- no hardcoded scenario-specific participant rows
- TypeScript passes
- lint passes
- tests pass
- build passes
- 1440×900 verified
- 390×844 verified
- 200% text zoom verified
- reduced-motion verified

---

# 28. Visual QA screenshots

After implementation, provide screenshots for:

1. READY desktop
2. READY reason expanded
3. NEED_CONFIRMATION desktop
4. WAITING desktop
5. READY_AFTER_CONFIRMATION desktop
6. NEXT_ALTERNATIVE desktop
7. NO_OPTION desktop
8. READY mobile
9. NEED_CONFIRMATION mobile
10. people impact expanded on mobile

---

# 29. Report after implementation

Return:

1. previous result-card structure
2. new Decision Surface architecture
3. files created
4. files modified
5. engine-to-view-model mapping
6. privacy-label mapping
7. responsive behavior
8. state transition behavior
9. accessibility implementation
10. TypeScript / lint / test / build results
11. any requirement not implemented

---

# 30. Final instruction

This patch is not about adding more information.

It is about compressing the right information into one decision surface.

The final experience must communicate:

```text
What time is proposed?
Can the meeting happen?
How does this affect each of the six people?
What single action is required now?
Why is this the least-coordination option?
```

Do not make the organizer inspect six calendars.

Do not hide the human impact of the decision.
