# Meeting Decision Prototype — Visual Implementation Spec v1.0

> Cursor implementation document  
> Visual concept: **Quiet Confidence / 조용한 확신**

---

## 0. How to use this document

Implement the prototype by treating this document as the visual and interaction source of truth.

Before editing code:

1. Inspect the current project structure.
2. Identify reusable layout, typography, button, card, icon, animation, and accessibility primitives.
3. List:
   - reusable existing components
   - new components to create
   - files to modify
   - implementation order
4. Then proceed with implementation.

Do not replace the existing design system or rewrite unrelated code.

---

# 1. Product intent

This product does not ask users to compare six calendars manually.

It should:

- show one actionable meeting-time decision
- explain the decision only when needed
- move the same decision object through different states
- provide a next action instead of a dead end
- avoid presenting any participant as the cause of failure
- preserve the attendee's right to approve or decline schedule use

The interface should feel as though a complex calculation has already been completed and the system is quietly handing the user the next decision.

---

# 2. Visual direction

## Concept

**Quiet Confidence**

The experience should feel:

- calm
- trustworthy
- decisive
- neutral
- lightweight
- respectful of relationships

It must not feel:

- futuristic or AI-driven
- like a scheduling dashboard
- like an error-resolution tool
- like a financial app clone
- like a calendar-grid product

## Core hierarchy

Every decision screen must preserve this priority:

1. proposed time
2. primary action
3. current state
4. attendance impact
5. required confirmation
6. reasons
7. secondary actions

The time must always be the strongest visual object.

---

# 3. Non-goals

Do not implement or visually suggest:

- a weekly or monthly calendar grid
- multiple recommendation cards
- Top 3 candidate times
- a dashboard layout
- AI sparkles, robots, magic wands, or scan visualizations
- participant score rankings
- weighting controls
- large avatar groups
- warning banners for ordinary scheduling conflicts
- red or orange error treatment for confirmation-required states
- confetti or celebratory effects
- glassmorphism copied from Toss
- Toss branding, Toss Blue, or direct visual imitation
- extra features not described in the product specification

---

# 4. Responsive layout

## Desktop organizer screens

```text
Reference viewport: 1440 × 900
Page content width: 560px
Maximum content width: 640px
Horizontal page padding: 32px minimum
Vertical page padding: 48px minimum
Alignment: centered
Visible core object: one DecisionCard
```

Do not place calendars, side panels, participant detail panels, or supplementary cards next to the DecisionCard.

## Mobile attendee screen

```text
Reference viewport: 390 × 844
Horizontal padding: 20px
Top padding: safe-area aware
Bottom action padding: safe-area aware
Content width: 100%
```

The attendee screen should focus only on:

- request
- proposed time
- conflict/protection information
- available / difficult response

---

# 5. Design tokens

Use existing project tokens when they are semantically equivalent.  
Otherwise define the following tokens.

## 5.1 Color tokens

```css
:root {
  --meeting-bg: #f5f6f8;
  --meeting-surface: #ffffff;

  --meeting-text-primary: #191f28;
  --meeting-text-secondary: #4e5968;
  --meeting-text-tertiary: #8b95a1;

  --meeting-divider: #e5e8eb;
  --meeting-panel: #f7f8fa;

  --meeting-primary: #3b6ff5;
  --meeting-primary-pressed: #315fd4;
  --meeting-primary-subtle: #eef3ff;

  --meeting-positive: #20a66a;
  --meeting-positive-subtle: #eaf8f1;

  --meeting-neutral-emphasis: #6b7684;
  --meeting-focus: #8fb2ff;

  --meeting-shadow:
    0 8px 24px rgba(0, 27, 55, 0.06);
}
```

## 5.2 State color rules

### Ready / ready-after-confirmation

- Primary CTA: `--meeting-primary`
- Small status icon only: `--meeting-positive`
- Do not tint the entire card green.

### Need confirmation / waiting

- Not an error state.
- Use `--meeting-primary-subtle` or `--meeting-panel`.
- Do not use red, orange, warning triangles, or alarming copy.

### Attendee decline

- Treat as a normal completion state.
- Do not use destructive colors.
- Do not style the decline action as disabled, dangerous, or shameful.

---

# 6. Typography

Use the current project Korean sans-serif font.

Preferred order:

1. existing project font
2. Pretendard
3. SUIT
4. system sans-serif

Do not add a new font solely for this prototype.

## 6.1 Desktop type scale

```text
Proposed time       36px / 46px / 700
Date                18px / 26px / 600
State title         24px / 34px / 700
Attendance summary  16px / 24px / 500
Body                15px / 23px / 400
Supporting text     14px / 21px / 400
Button              16px / 24px / 600
```

## 6.2 Mobile type scale

```text
Proposed time       28px / 38px / 700
Screen title        24px / 34px / 700
Body                16px / 24px / 400
Supporting text     14px / 21px / 400
Button              16px / 24px / 600
```

## 6.3 Typography rules

- Date and time must not have the same size.
- State title must not overpower the time.
- Keep body copy to approximately 32–36 Korean characters per line.
- Keep explanatory paragraphs to 3 lines or fewer when possible.
- Do not place long sentences inside pills or badges.
- Do not use fixed-height text containers.
- Layout must remain stable with browser text zoom and longer Korean text.

---

# 7. Spacing and shape

## 7.1 Spacing scale

```text
4px   micro spacing
8px   icon-to-text
12px  within one information group
16px  between related groups
24px  between major sections
32px  major internal card separation
40px  between page heading and card
```

## 7.2 Radius tokens

```css
:root {
  --meeting-radius-card: 24px;
  --meeting-radius-panel: 16px;
  --meeting-radius-button: 14px;
  --meeting-radius-input: 12px;
  --meeting-radius-pill: 999px;
}
```

## 7.3 Surface rules

### DecisionCard

```text
Desktop width: 560px
Maximum width: 640px
Background: white
Padding: 32px
Radius: 24px
Border: none by default
Optional border: 1px solid #E5E8EB
Shadow: subtle token only
```

### Mobile information panel

```text
Padding: 20px
Radius: 20px
Background: #F7F8FA or neutral surface
```

Avoid nested-card overload.

Do not:

- turn every information group into a separate card
- use multiple strong borders
- place six participant badges inside the card
- make every element pill-shaped

---

# 8. Shared component architecture

Implement one shared state-based component.

```ts
export type DecisionCardState =
  | "ready"
  | "need-confirmation"
  | "waiting"
  | "ready-after-confirmation"
  | "next-alternative";
```

Recommended component structure:

```text
DecisionCard
├── DecisionStatus
│   ├── StatusIcon
│   └── StatusTitle
├── DateTimeBlock
├── DecisionImpact
│   ├── AttendanceSummary?
│   └── ConfirmationPanel?
├── PrimaryAction?
├── ReasonSummary?
├── ReasonDisclosure?
└── SecondaryActions?
```

## Critical rule

Do not create separately designed cards for each state.

The following must remain stable across states:

- card width
- outer padding
- date and time location
- primary action area
- text hierarchy
- secondary-action area

Only change:

- state message
- icon
- impact content
- primary action
- reason content
- secondary actions

---

# 9. Shared card layout

Recommended internal order:

```text
Status
↓ 24px
Date + Time
↓ 24px
Attendance impact or confirmation panel
↓ 24px
Primary CTA
↓ 24px
Reason summary
↓ 16px
Disclosure / secondary actions
```

The Primary CTA intentionally appears before detailed reasons.

Reason:

- users who trust the recommendation can act immediately
- users with questions can expand the reason
- the product does not force explanation reading before action

---

# 10. State specification — Ready

## Purpose

Communicate:

- calculation is complete
- the meeting can be confirmed now
- no additional human confirmation is required
- optional-attendee absence is not an error

## Required copy

```text
Status:
가장 적은 조율로 확정할 수 있어요

Date:
7월 15일 수요일

Time:
오후 3:00–4:00

Attendance:
필수 참석자 4명 모두 가능
선택 참석자 2명 중 1명 가능

Primary CTA:
이 시간으로 확정

Reasons:
외근 전후 시간을 피했어요
개인 선호 충돌이 가장 적어요

Disclosure:
추천 기준 보기
```

## Visual hierarchy

1. `오후 3:00–4:00`
2. `이 시간으로 확정`
3. required-attendee availability
4. state title
5. optional-attendee availability
6. reasons
7. disclosure

## Status icon

- 24px circular icon container
- subtle positive background
- check icon
- do not create a large success banner
- do not add a “추천” badge

## Attendance summary format

Use two text rows, not six avatars.

```text
필수 참석자    4명 모두 가능
선택 참석자    2명 중 1명 가능
```

- labels: secondary color
- result: primary color
- no warning icon for optional-attendee absence

## Reason summary

Use a maximum of 2 short sentence rows.

Do not use multiple filter chips.

---

# 11. State specification — Reason expanded

## Interaction

- expand inside the same card
- no modal
- no route change
- keep time and Primary CTA visible
- insert a divider before the expanded content
- animate height and opacity

## Required content

```text
이 시간을 추천한 이유

필수 참석자
4명 모두 가능

이동 일정
외근 전후 시간과 겹치지 않음

개인 선호
충돌하는 선호 없음

선택 참석자
2명 중 1명 가능

필수 참석자 가능 여부를 먼저 확인한 뒤,
일정 충돌과 선호가 적은 순서로 비교했어요.
```

## Layout

- divider: 1px `--meeting-divider`
- labels: 14px, secondary
- values: 15–16px, primary
- desktop: 2-column definition layout allowed
- mobile: stack into 1 column

Do not expose:

- numeric scores
- algorithm weights
- alternative time rankings
- participant-specific private preference details

---

# 12. State specification — Need confirmation

## Purpose

Communicate:

- this is not a failure
- one confirmation can unlock a valid time
- the system will ask on behalf of the organizer
- the attendee remains in control

## Required copy

```text
Status:
한 번의 확인으로 모두 가능해요

Date:
7월 16일 목요일

Time:
오후 3:00–4:00

Confirmation:
이지훈 님의 개인 보호 시간을
사용할 수 있는지 확인해야 해요

Result:
확인되면 필수 참석자 4명 전원 참석 가능

Primary CTA:
가능 여부 묻기

Supporting:
현재 가장 적은 확인이 필요한 시간이에요

Secondary:
조건 바꾸기
```

## Visual rules

Keep the same DecisionCard skeleton as `ready`.

Do not:

- make the card yellow or red
- show an error banner
- lead with “가능한 시간이 없습니다”
- show multiple alternative cards
- over-emphasize the participant's avatar
- describe the participant as the cause

## ConfirmationPanel

```text
Background: #F7F8FA
Radius: 16px
Padding: 20px
Border: none
Optional icon: small shield or lock
```

Mention the participant's name once in the main sentence.

Do not reveal:

- private calendar title
- why the time was protected
- algorithm judgment about importance
- pressure from the other participants

---

# 13. State specification — Waiting

## Purpose

Show that the request was sent and no organizer action is currently required.

## Required copy

```text
Status:
이지훈 님의 응답을 기다리고 있어요

Date:
7월 16일 목요일

Time:
오후 3:00–4:00

Impact:
현재 필수 참석자 3명은 가능해요

Supporting:
응답이 오면 다시 알려드릴게요

Secondary:
요청 취소
조건 바꾸기
```

## State-change behavior

Keep the DateTimeBlock in the exact same visual position.

Replace the Primary CTA area with:

- subtle progress indicator, or
- neutral waiting-state text

Do not add:

- `5/6` progress
- countdown
- resend notification
- direct-message action
- “한 명만 남았어요”
- large participant portrait

---

# 14. State specification — Ready after confirmation

## Required copy

```text
Status:
이제 확정할 수 있어요

Date:
7월 16일 목요일

Time:
오후 3:00–4:00

Attendance:
필수 참석자 4명 모두 가능
선택 참석자 2명 모두 가능

Primary CTA:
이 시간으로 확정

Supporting:
필요한 일정 확인이 끝났어요
```

Do not emphasize:

- who made a concession
- who “helped” the team
- sacrifice or gratitude
- the participant's private response

The visual focus must return to the decision and confirmation action.

---

# 15. State specification — Next alternative

## Required copy

```text
Status:
목요일 오후 3시는 조율하기 어려워요
다음으로 확인이 적은 시간을 찾았어요

Date:
7월 17일 금요일

Time:
오전 11:00–12:00

Confirmation:
박서연 님의 개인 보호 시간을
사용할 수 있는지 확인해야 해요

Result:
확인되면 필수 참석자 4명 모두 참석 가능

Primary CTA:
가능 여부 묻기

Secondary:
조건 바꾸기
```

Do not display the previous attendee's decline reason.

The next-alternative state must reuse the `need-confirmation` visual structure.

---

# 16. Attendee response screen

## Purpose

The attendee should feel:

- their schedule is protected
- either answer is acceptable
- private information is not shared
- the decision is easy and quick

## Required copy

```text
Title:
이 시간에 회의가 가능한지 확인해주세요

Date:
7월 16일 목요일

Time:
오후 3:00–4:00

Conflict:
개인 보호 시간과 겹쳐요

Privacy:
응답 사유와 일정 내용은
다른 사람에게 공개되지 않아요

Primary:
이 시간 사용 가능

Secondary:
이 시간은 어려워요
```

## Layout order

1. screen title
2. date
3. time
4. neutral protection/privacy panel
5. available action
6. difficult action

## Protection panel

```text
Background: #F7F8FA
Radius: 20px
Padding: 20px
Icon: small shield or lock
```

The icon must not make the panel look like a security warning.

## Buttons

```text
Height: 56px
Gap: 12px
Primary: filled
Secondary: white surface + 1px divider border
Text contrast: full readable contrast
```

The decline action must not:

- look disabled
- use red
- be visually hidden
- use guilt-inducing text
- require a reason

Both options are valid product outcomes.

---

# 17. Buttons

## Desktop

```text
Height: 52px
Radius: 14px
Font: 16px / 24px / 600
Width: 100% inside DecisionCard
```

## Mobile

```text
Height: 56px
Radius: 14px
Font: 16px / 24px / 600
Width: 100%
```

## Interaction states

Implement:

- default
- hover
- pressed
- keyboard focus
- loading
- disabled only when truly unavailable

Do not use disabled styling for a valid alternative action.

---

# 18. Icons

Use the existing project icon library if available.

Allowed semantic icons:

- check: condition fulfilled
- users: attendance summary
- shield/lock: private protected time
- clock: proposed time or waiting
- chevron: expand/collapse

Rules:

- size: 18–20px, except 24px status container
- icons support text; they do not replace text
- decorative icons must be `aria-hidden`
- icon-only controls require functional accessible labels
- do not use emoji

---

# 19. Motion tokens

Use restrained, purposeful motion.

```css
:root {
  --meeting-motion-quick: 160ms;
  --meeting-motion-standard: 240ms;
  --meeting-motion-emphasis: 320ms;

  --meeting-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --meeting-ease-emphasis: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Card appearance

```text
opacity: 0 → 1
translateY: 8px → 0
duration: 240ms
```

## Reason expansion

- height/content-size transition
- opacity transition
- duration: 240ms
- prevent scroll jump
- avoid layout flicker

## Request send

1. button changes to `요청 보내는 중`
2. show small spinner inside button
3. replace card content with waiting state
4. do not open a success modal

## Attendee response

- pressed feedback: 80–120ms
- completion: short fade / subtle scale
- no bounce
- no confetti
- no looping animation

## Reduced motion

When `prefers-reduced-motion: reduce`:

- remove translation and scale
- use opacity only
- remove repeating indicators where possible
- preserve state feedback

---

# 20. Accessibility

Implement the following:

- minimum touch target: 44×44px
- text contrast: WCAG AA target
- do not rely on color alone
- visible 2px focus ring using `--meeting-focus`
- loading and state changes announced with `aria-live="polite"`
- recommendation disclosure button exposes `aria-expanded`
- when expanded, focus may move to the reason heading
- when collapsed, return focus to the disclosure control
- meaningful button text; no icon-only primary actions
- decorative icons hidden from screen readers
- layout supports browser text zoom
- no fixed card height
- mobile bottom actions respect safe areas

---

# 21. Implementation guidance

## Recommended component API

```ts
type DecisionCardProps = {
  state: DecisionCardState;
  dateLabel: string;
  timeLabel: string;
  attendance?: {
    requiredAvailable: number;
    requiredTotal: number;
    optionalAvailable: number;
    optionalTotal: number;
  };
  confirmation?: {
    participantName: string;
    conflictLabel: string;
    resultLabel: string;
  };
  reasons?: string[];
  details?: Array<{
    label: string;
    value: string;
  }>;
  isReasonExpanded?: boolean;
  isLoading?: boolean;
  onPrimaryAction?: () => void;
  onToggleReason?: () => void;
  onCancelRequest?: () => void;
  onChangeConditions?: () => void;
};
```

Prefer semantic props and shared slots over state-specific duplicated markup.

## Suggested files

Adapt names to the existing project structure.

```text
src/
  features/
    meeting-decision/
      components/
        decision-card.tsx
        decision-status.tsx
        date-time-block.tsx
        attendance-summary.tsx
        confirmation-panel.tsx
        reason-disclosure.tsx
        attendee-response.tsx
      data/
        meeting-scenarios.ts
      model/
        meeting-decision.types.ts
      styles/
        meeting-decision.tokens.css
```

Do not force this folder structure if the project already has a clear feature architecture.

---

# 22. Forbidden implementation decisions

Do not:

- introduce an unrelated component library
- replace the existing theme globally
- hard-code separate duplicated cards for every state
- create a dashboard wrapper
- add a calendar grid
- add multiple recommendations
- add complex filters
- add participant scores
- add AI explanation graphics
- add red/orange conflict treatments
- add extra modals
- add hover-only essential information
- add features not defined in the product flow
- expose private schedule information
- require a reason for declining
- remove keyboard focus styles
- use fixed card heights
- use layout shifts that move the time significantly between states

---

# 23. Acceptance criteria

The visual implementation is complete when:

## Shared system

- one shared DecisionCard handles all organizer states
- layout remains visually stable across state changes
- time is the strongest element in every decision state
- one Primary CTA is visible at most
- reason and secondary actions remain visually subordinate

## Ready state

- required and optional attendance are clearly separated
- optional absence does not look like an error
- reason disclosure expands inside the same card
- time and confirm action remain visible while expanded

## Need-confirmation state

- state does not look like an error
- participant is not framed as the problem
- required confirmation and resulting benefit are easy to understand
- the organizer has one clear next action

## Waiting state

- the request feels successfully sent
- no pressure, countdown, or resend action appears
- the proposed time stays in the same position

## Attendee response

- proposed time is immediately visible
- private/protected context is clear
- both response options are readable and valid
- declining requires no explanation
- no guilt-inducing copy or visuals appear

## Motion and accessibility

- motion communicates state change without decoration
- reduced-motion mode works
- keyboard focus is visible
- dynamic state changes are announced
- text zoom does not break the layout
- mobile touch targets meet minimum size

## Quality

- TypeScript passes
- lint passes
- project build passes
- no unrelated pages or components are removed
- no undocumented feature is introduced

---

# 24. Final instruction for Cursor

Implement this visual system exactly within the existing project conventions.

Priority order:

1. semantic state architecture
2. stable information hierarchy
3. shared reusable component
4. responsive layout
5. purposeful motion
6. accessibility
7. pixel-level refinement

Do not optimize for visual novelty.

Optimize for a calm, decisive experience in which the same decision object moves naturally from recommendation, to confirmation request, to waiting, and finally to meeting confirmation.
