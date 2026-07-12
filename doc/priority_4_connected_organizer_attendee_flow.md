# Priority 4 — Organizer-to-Attendee Connected Flow

> Cursor implementation request  
> Scope: **Request creation, attendee deep-link experience, response completion, and organizer state synchronization**  
> Prerequisites:
> - Priority 1 dynamic decision engine is implemented.
> - Priority 2 Decision Surface is implemented.
> - Priority 3 participant setup and impact hierarchy are implemented.

---

# 0. Goal

Connect the organizer and attendee experiences as one product flow.

The user must experience:

```text
Organizer finds a coordination-required time
→ Organizer sends a request
→ A request object is created
→ Attendee receives and opens the request
→ Attendee approves or declines
→ The same decision engine recomputes
→ Organizer sees the updated result
```

The flow must not behave like unrelated screens connected by demo buttons.

### Product principle

```text
One request.
Two users.
One synchronized decision state.
```

The organizer must never manually recreate the attendee's response.

The attendee must never see information that is unnecessary for their decision.

---

# 1. Why this patch is necessary

The current prototype shows the organizer and attendee screens, but the connection between them is mostly explained by review navigation.

This creates three weaknesses:

1. the request does not feel like a real product object
2. attendee response does not visibly update the organizer's decision
3. the reviewer sees screen transitions rather than a connected experience

This patch must make the relationship between the two actors visible through shared state and consistent data.

---

# 2. Scope

## Implement in this patch

- scheduling request entity
- request lifecycle state
- request preview before send
- request creation
- organizer waiting state
- attendee notification/deep-link simulation
- attendee response screen
- approve and decline completion screens
- response synchronization
- decision-engine recomputation
- organizer updated-result screen
- review-shell actor transition
- URL/session persistence suitable for Vercel review
- tests for the full connected flow

## Do not implement in this patch

- real push notification
- real email or messenger integration
- backend database
- authentication
- multi-device synchronization
- request cancellation
- resend notification
- reminders or countdown
- decline reason input
- chat or comments
- calendar API integration
- meeting creation redesign
- review landing redesign

This is still a prototype, but its internal state must behave like a real product.

---

# 3. Actor model

```ts
export type PrototypeActor = "organizer" | "attendee";
```

The actor changes the visible product shell, not the underlying request data.

## Organizer can

- inspect a recommendation
- send a confirmation request
- wait for a response
- view the recomputed result
- confirm the meeting

## Attendee can

- inspect the proposed meeting
- understand the conflict
- approve use of the protected slot
- decline without giving a reason
- see a response-completion state

The attendee cannot:

- edit required/optional roles
- view other participants' private context
- see the full ranking logic
- confirm the final meeting
- know why another person was or was not selected

---

# 4. Request entity

Create one domain object.

```ts
export type SchedulingRequestStatus =
  | "draft"
  | "sent"
  | "pending"
  | "approved"
  | "declined"
  | "resolved";

export type SchedulingRequest = {
  id: string;
  meetingDraftId: string;

  slotId: TimeSlotId;
  dateLabel: string;
  timeLabel: string;

  organizerId: string;
  targetParticipantId: string;

  conflictPublicLabel: string;
  status: SchedulingRequestStatus;

  createdAt: string;
  respondedAt?: string;

  response?: "approved" | "declined";
};
```

## Rules

- the request captures the exact selected slot
- the target participant is a required participant from the engine's confirmation target
- public conflict label must be privacy-safe
- request ID remains stable through the response
- do not store a decline reason
- do not expose raw calendar titles

---

# 5. Meeting draft entity

The request must belong to one meeting-decision session.

```ts
export type MeetingDecisionSession = {
  id: string;

  organizerId: string;
  participantIds: string[];
  attendanceTypes: Record<string, AttendanceType>;

  currentRecommendation: MeetingRecommendation;
  previousRecommendation?: MeetingRecommendation;

  responseOverrides: ResponseOverrides;
  activeRequest?: SchedulingRequest;

  actor: PrototypeActor;
  createdAt: string;
  updatedAt: string;
};
```

This session is the source of truth for the connected prototype.

Do not keep separate organizer and attendee scenario objects.

---

# 6. Request lifecycle

Use this lifecycle:

```text
draft
→ sent
→ pending
→ approved or declined
→ resolved
```

## Draft

Organizer has opened request preview but has not sent.

## Sent

Send action is being processed.

This can be very brief.

## Pending

Organizer waiting and attendee request available.

## Approved

Attendee approved use of the exact protected slot.

## Declined

Attendee declined use of the exact protected slot.

## Resolved

The decision engine has recomputed and organizer result has been updated.

---

# 7. Request creation flow

## Entry condition

Priority 1 engine returns:

```text
NEED_CONFIRMATION
```

The Decision Surface shows one or more confirmation targets.

For this patch, request the first unresolved required target.

Do not request optional participants.

## Organizer Primary CTA

```text
가능 여부 묻기
```

Clicking it opens request preview.

Do not send immediately without preview.

---

# 8. Request preview

## Purpose

The organizer must know:

- who will receive the request
- which time is being requested
- what the attendee will be asked
- what information will remain private

## Required content

```text
이렇게 확인할게요

받는 사람
이지훈

7월 16일 목요일
오후 3:00–4:00

이 시간에 회의 참석이 가능한지 확인합니다.

개인 일정의 상세 내용과 응답 사유는
다른 참석자에게 공개되지 않아요.
```

## Primary CTA

```text
요청 보내기
```

## Secondary CTA

```text
돌아가기
```

## Rules

- organizer may go back before sending
- do not offer condition editing inside the preview
- do not show private event title
- do not say `양보 요청`
- do not show how many people are waiting
- do not pressure the attendee

---

# 9. Sending behavior

When `요청 보내기` is selected:

1. create a `SchedulingRequest`
2. set status to `sent`
3. disable duplicate submission
4. show `요청 보내는 중`
5. transition to `pending`
6. update the organizer Decision Surface to waiting
7. make attendee route available

Do not show a separate success modal.

---

# 10. Organizer waiting state

## Product UI

The Decision Surface remains the same object.

Required copy:

```text
응답을 기다리고 있어요.

확인되면 회의를 확정할 수 있는지 알려드릴게요.
```

Person impact row:

```text
이지훈
개인 보호 시간
응답 대기
```

## Do not show

- request cancel
- resend
- countdown
- `5명은 기다리고 있어요`
- direct-message action
- pressure copy
- repeating spinner

## Important

The waiting state must be derived from:

```ts
activeRequest.status === "pending"
```

Do not navigate to an unrelated static waiting screen.

---

# 11. Attendee route

Create a route that behaves like a deep link.

Recommended:

```text
/prototype/respond/:requestId
```

Or use the existing router pattern.

The page must read the request by ID from the shared session store.

Do not create attendee content from query-string copy alone.

## Invalid request

If the request does not exist:

```text
요청을 찾을 수 없어요.
```

## Already responded

If request status is approved or declined:

show the stored completion state.

Do not allow a second response.

---

# 12. Prototype persistence

The Vercel review flow must survive route changes and reasonable page refreshes.

Use one of:

1. existing app store with persistence
2. sessionStorage
3. localStorage with a prototype-session namespace

Recommended key:

```text
toss-meeting-decision-session-v1
```

## Rules

- persist only prototype mock data
- do not persist private raw event titles
- reset option available from review landing/debug mode
- actor route and request ID must restore correctly
- attendee refresh must not lose the request
- organizer refresh after response must show the recomputed result

---

# 13. Attendee notification simulation

Actual product behavior:

```text
Organizer sends request
→ attendee receives messenger/push notification
→ attendee opens deep link
```

Prototype behavior must communicate this without pretending the organizer pressed a real attendee-product CTA.

## Review Shell

Outside the product Decision Surface, show:

```text
다음 장면

이지훈 님에게 일정 확인 알림이 도착했어요.

[ 참석자 알림 열기 ]
```

Recommended CTA:

```text
참석자 알림 열기
```

Better than:

```text
참석자 화면에서 응답하기
```

because it describes the actual transition.

## Visual distinction

- Review Shell is outside the product surface
- neutral panel
- small `다음 장면` label
- must not look like a product Primary CTA
- hidden in `?usertest=1`
- visible in default review mode

---

# 14. Optional notification preview

Recommended for the review experience.

Show a small mobile-notification preview in the Review Shell:

```text
회의 시간 확인

김민지 님이 일정 가능 여부를 물었어요.
7월 16일 목요일 · 오후 3:00–4:00

[열기]
```

This preview is review-only.

Do not put it inside the actual organizer product card.

---

# 15. Attendee screen information hierarchy

The attendee must understand the request in this order:

1. meeting context
2. proposed time
3. what conflicts
4. privacy boundary
5. response actions

## Required screen

### Header

```text
일정 확인
```

### Meeting context

```text
대시보드 개선 방향 논의
김민지 님이 요청했어요.
```

If the meeting title has not been entered yet, use:

```text
팀 회의
김민지 님이 요청했어요.
```

Do not invent a misleading meeting title.

### Date and time

```text
7월 16일 목요일
오후 3:00–4:00
```

### Question

```text
이 시간, 괜찮으세요?
```

### Conflict panel

```text
개인 보호 시간과 겹쳐요.

일정 내용과 응답 사유는
다른 사람에게 공개되지 않아요.
```

### Supporting text

Optional:

```text
응답하면 다른 참석자 일정과 다시 확인할게요.
```

### Actions

```text
이 시간 사용 가능
이 시간은 어려워요
```

---

# 16. Attendee privacy rules

The attendee screen may show:

- their own abstracted conflict label
- organizer name
- meeting title or generic meeting context
- proposed date and time
- privacy explanation

It must not show:

- other attendees' private schedule states
- ranking logic
- who else is available
- `everyone else is waiting`
- exact protected-event title
- inferred importance
- request-pressure language

---

# 17. Attendee action semantics

## Approve

Button:

```text
이 시간 사용 가능
```

Meaning:

```text
This protected slot may be used for this specific meeting proposal.
```

It does not mean:

- permanent preference change
- move every protected event
- create the meeting immediately
- accept all future requests

Apply override only to:

```text
target participant + exact slot
```

## Decline

Button:

```text
이 시간은 어려워요
```

Rules:

- no reason required
- no destructive color
- no confirmation guilt dialog
- no warning that others are waiting
- response is final for this request

---

# 18. Response processing

## Approve flow

When attendee approves:

1. update request status to `approved`
2. set response and respondedAt
3. set response override:

```ts
responseOverrides[targetParticipantId][slotId] = "approved";
```

4. call Priority 1 `recommendMeeting`
5. store previous recommendation
6. store new recommendation
7. set request status to `resolved`
8. show attendee approval completion screen
9. make organizer updated-result route available

Expected default result:

```text
READY
same slot
```

## Decline flow

When attendee declines:

1. update request status to `declined`
2. set response and respondedAt
3. set response override:

```ts
responseOverrides[targetParticipantId][slotId] = "declined";
```

4. call Priority 1 `recommendMeeting`
5. store previous recommendation
6. store new recommendation
7. set request status to `resolved`
8. show attendee decline completion screen
9. make organizer next-result route available

Expected default result:

```text
NEED_CONFIRMATION
different slot
next target: 박서연
```

Do not navigate to a hardcoded next-alternative object.

---

# 19. Attendee approval completion

## Required screen

```text
[체크 아이콘]

가능하다고 전달했어요.

회의가 확정되면
캘린더에 반영돼요.

[ 확인 ]
```

## Meaning

The meeting is not yet confirmed.

Do not say:

```text
회의가 확정됐어요.
```

## Visual rules

- calm completion
- no confetti
- no large green success page
- same completion visual language as decline

---

# 20. Attendee decline completion

## Required screen

```text
[체크 아이콘]

어렵다고 전달했어요.

다른 시간을 다시 찾을게요.

[ 확인 ]
```

## Rules

- no apology
- no red failure treatment
- no reason input
- no suggestion that the attendee harmed the group

---

# 21. Review transition after attendee completion

The product completion screen's `확인` should close the attendee product state.

Then the Review Shell communicates the actor transition.

## After approval

```text
주최자에게 응답이 반영됐어요.

[ 확정 가능한 시간 보기 ]
```

## After decline

```text
주최자에게 응답이 반영됐어요.

[ 새로 계산된 시간 보기 ]
```

This is review navigation, not attendee product functionality.

Keep it visually outside the attendee completion surface.

---

# 22. Organizer updated result

## Approval result

Show Priority 2 mode:

```text
READY_AFTER_CONFIRMATION
```

Required:

- same slot
- target impact changes `응답 대기 → 가능`
- state: `이제 확정할 수 있어요`
- Primary CTA: `이 시간으로 확정`
- no concession framing

## Decline result

Show Priority 2 presentation mode:

```text
NEXT_ALTERNATIVE
```

Required:

- engine-selected new slot
- all six impacts recalculated
- previous attendee's decline reason hidden
- new target shown if needed
- one new Primary CTA

Supporting:

```text
이전 시간은 일정 확인이 어려워 제외했어요.
```

Do not say:

```text
이지훈 님이 거절했어요.
```

---

# 23. Multiple confirmation targets

The engine may return more than one required confirmation target.

Support this correctly.

## Initial surface

```text
확인 2번이면 필수 참석자가 모두 가능해요.
```

## Request strategy

Request one target at a time.

Recommended order:

- engine target order
- or stable participant order

After first approval:

1. apply override
2. recompute
3. if still `NEED_CONFIRMATION`, create the next request preview
4. do not show ready state early

After any decline:

1. apply decline
2. recompute
3. use new recommendation

Do not create parallel pending requests in this prototype.

---

# 24. State-machine model

Recommended states:

```ts
export type ConnectedFlowState =
  | "organizer-result"
  | "request-preview"
  | "sending-request"
  | "organizer-waiting"
  | "attendee-request"
  | "attendee-submitting"
  | "attendee-approved"
  | "attendee-declined"
  | "organizer-updated-result";
```

State transitions:

```text
organizer-result
→ request-preview
→ sending-request
→ organizer-waiting
→ attendee-request
→ attendee-submitting
→ attendee-approved or attendee-declined
→ organizer-updated-result
```

Do not use `scenarioId` to determine these transitions.

Use request/session state.

---

# 25. Route model

Recommended:

```text
/prototype/session/:sessionId/organizer
/prototype/session/:sessionId/respond/:requestId
```

Review transitions may preserve the same session ID.

If the project architecture is simpler, an equivalent route design is acceptable.

Critical requirements:

- one session
- one request ID
- actor-specific view
- refresh persistence
- no duplicated scenario state

---

# 26. Data consistency rules

The following values must match across organizer and attendee screens:

- request ID
- target participant
- date
- time
- conflict public label
- organizer
- meeting title/context

After response, organizer result must use the updated engine output.

Add runtime assertions in development if helpful.

Example:

```ts
assert(activeRequest.slotId === currentRequestedSlot.id);
```

Do not silently render mismatched data.

---

# 27. Review mode vs user-test mode

## Default review mode

```text
?review=1
```

Allowed:

- actor-transition Review Shell
- notification preview
- `다음 장면` explanation
- routes to both actors

## User-test mode

```text
?usertest=1
```

Hide:

- Review Shell
- notification preview
- reviewer navigation
- scenario explanation

In user-test mode, test organizer and attendee separately with their direct URLs.

Do not let review explanations improve the measured usability.

---

# 28. Visual continuity

The organizer and attendee screens must feel like the same product.

Share:

- typography family
- primary action color
- radius language
- spacing rhythm
- icon family
- completion-state language

Do not force identical layouts.

Organizer:

- desktop decision surface
- group impact

Attendee:

- mobile single decision
- personal context

This is one product with actor-specific information hierarchy.

---

# 29. Motion

Use motion only to explain state continuity.

## Request send

```text
Button loading
→ Decision Surface content changes to waiting
```

Do not remount the entire surface.

## Attendee response

```text
Selected button pressed
→ short submitting state
→ completion screen
```

## Organizer update

```text
Pending impact row changes in place
→ state message updates
→ Primary CTA appears or new time updates
```

For decline/new slot:

- time may crossfade
- people statuses update
- do not animate an entire card flying out

## Reduced motion

- opacity only
- no scale or translation required
- no looping animation

---

# 30. Accessibility

Implement:

- request preview heading and recipient announced
- loading state announced with `aria-live="polite"`
- only the changed status region is live
- response buttons accessible by keyboard
- completion heading receives focus
- Review Shell excluded from product landmark or clearly labeled as review navigation
- attendee screen supports 200% text zoom
- button touch targets at least 44px
- status not represented by color alone
- already-responded request does not expose active buttons

Screen-reader examples:

```text
회의 시간 확인 요청, 7월 16일 목요일 오후 3시부터 4시
```

```text
가능하다고 전달했어요. 회의가 확정되면 캘린더에 반영됩니다.
```

---

# 31. Suggested file structure

Adapt to existing architecture.

```text
features/
  meeting-decision/
    connected-flow/
      connected-flow.types.ts
      connected-flow.store.ts
      connected-flow.actions.ts
      connected-flow.persistence.ts
      connected-flow.test.ts

    request/
      request-preview.tsx
      organizer-waiting.tsx
      attendee-request-screen.tsx
      attendee-response-complete.tsx

    review/
      actor-transition-shell.tsx
      notification-preview.tsx
```

Keep engine recomputation in Priority 1 engine.

Do not duplicate recommendation logic inside the connected-flow store.

---

# 32. Suggested actions

```ts
export type ConnectedFlowActions = {
  openRequestPreview(targetParticipantId: string): void;
  sendRequest(): Promise<void>;

  openAttendeeRequest(requestId: string): void;

  approveRequest(requestId: string): void;
  declineRequest(requestId: string): void;

  returnToOrganizer(sessionId: string): void;
  resetPrototypeSession(): void;
};
```

Each action should validate the current lifecycle status.

Example:

- cannot approve a draft request
- cannot respond twice
- cannot send without a confirmation target

---

# 33. Tests

Use existing Vitest setup.

## Domain tests

- request captures exact slot and target
- approval applies only to exact target and slot
- decline applies only to exact target and slot
- response does not store a reason
- optional participant cannot become request target
- request cannot be answered twice
- already-resolved request restores completion state

## Full approval flow

```text
NEED_CONFIRMATION
→ create request for 이지훈 / thu-15
→ pending
→ approve
→ engine recompute
→ READY / thu-15
→ organizer updated result
```

## Full decline flow

```text
NEED_CONFIRMATION
→ create request for 이지훈 / thu-15
→ pending
→ decline
→ engine recompute
→ NEED_CONFIRMATION / fri-11 / 박서연
→ organizer next alternative
```

## Persistence tests

- organizer refresh in waiting keeps active request
- attendee deep-link refresh keeps request
- organizer refresh after approval shows ready result
- organizer refresh after decline shows new recommendation
- invalid request ID shows safe error

## Privacy tests

Rendered organizer and attendee output must not contain:

```text
병원
개인 약속
상담
declineReason
raw event title
```

## UI interaction tests

- send button prevents duplicate submission
- attendee buttons disable while submitting
- completion receives focus
- reviewer actor transition is hidden in user-test mode

---

# 34. Forbidden implementation decisions

Do not:

- create independent organizer and attendee scenario data
- hardcode approval result
- hardcode decline result
- expose decline reason
- add request cancellation without a complete product policy
- add resend or countdown
- show `everyone else is waiting`
- place reviewer navigation inside the Decision Surface
- let attendee confirm the final meeting
- use a real-looking product CTA for actor switching
- lose session data on route change
- respond to an already-resolved request
- display raw private schedule labels

---

# 35. Acceptance criteria

The patch passes when:

- organizer sends a request tied to the engine recommendation
- one stable request ID is created
- organizer waiting state is derived from request status
- attendee opens the exact request through a route
- date/time/target are consistent across both actors
- attendee can approve or decline without giving a reason
- approval recomputes and produces organizer ready state
- decline recomputes and produces a new engine recommendation
- organizer never manually selects the response result
- review actor navigation is outside product UI
- review navigation is hidden in user-test mode
- refresh preserves the session
- optional participant is never requested
- private event title and decline reason never appear
- TypeScript passes
- lint passes
- tests pass
- build passes
- 1440×900 organizer view verified
- 390×844 attendee view verified
- 200% text zoom verified
- reduced-motion verified

---

# 36. Visual QA screenshots

After implementation, provide:

1. request preview
2. organizer waiting
3. waiting + review notification preview
4. attendee request mobile
5. attendee approval completion
6. organizer ready-after-confirmation
7. attendee decline completion
8. organizer next-alternative
9. already-responded attendee route
10. invalid request route
11. review mode
12. user-test mode

Also provide a short screen recording for:

```text
Organizer request
→ attendee approve
→ organizer ready
```

and:

```text
Organizer request
→ attendee decline
→ organizer next alternative
```

---

# 37. Report after implementation

Return:

1. connected-flow architecture
2. request lifecycle
3. session persistence method
4. route structure
5. files created
6. files modified
7. approval recomputation result
8. decline recomputation result
9. review-mode behavior
10. user-test-mode behavior
11. privacy controls
12. test results
13. TypeScript / lint / build results
14. any requirement not implemented

---

# 38. Final instruction

This patch must prove that the product connects two users, not just two screens.

The final experience should make the reviewer understand:

```text
The organizer sends one specific request.
The attendee controls whether their protected time can be used.
The response remains private.
The same decision engine recalculates the group outcome.
The organizer receives a new actionable state.
```

Do not simulate this by jumping between hardcoded pages.

Build one synchronized product state shared by both actors.
