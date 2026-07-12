# Priority 1 — Dynamic Meeting Decision Engine Patch

> Cursor implementation request  
> Scope: **Data model, decision rules, dynamic recomputation, and tests only**  
> Do not redesign the visual UI in this patch.

---

## 0. Goal

Replace the current scenario-driven, precomputed result flow with a deterministic meeting decision engine.

The engine must calculate the next screen from:

- each participant's required/optional role
- each participant's mock schedule state
- protected time
- preference/travel penalties
- attendee approval or decline responses

The result must change when the reviewer changes required/optional roles.

### Critical rule

`scenarioId` may set initial values, but it must never directly choose a result screen.

Bad:

```ts
if (scenarioId === "coordination") {
  return confirmationScenario;
}
```

Required:

```ts
const result = recommendMeeting({
  participants,
  attendanceTypes,
  responseOverrides,
  candidateSlots,
});
```

The product must behave like a system, not a sequence of hardcoded screens.

---

# 1. Before implementation

Inspect the existing project and report:

1. current participant and scenario data structure
2. current state-management approach
3. every place where `scenarioId` or a preset directly determines a result
4. reusable existing types and utilities
5. files to create
6. files to modify
7. test runner currently available

Then implement the patch.

Do not rewrite unrelated UI components.

---

# 2. Product assumptions

## Meeting scope

- 6 coworkers total
- organizer is included
- next week
- exactly 1 hour
- weekday working hours
- organizer is required and locked in this prototype
- the other 5 participants can switch between required and optional

## Why the organizer is locked

This prototype focuses on the common case where the organizer also attends and leads the meeting.

Do not add proxy scheduling in this patch.

---

# 3. Domain model

Adapt names to the current codebase, but preserve these semantics.

```ts
export type AttendanceType = "required" | "optional";

export type SoftConstraintKind =
  | "preference"
  | "travel"
  | "meeting-density";

export type SlotState =
  | {
      type: "free";
    }
  | {
      type: "hard-busy";
      publicLabel: string;
    }
  | {
      type: "protected";
      requestable: true;
      publicLabel: "개인 보호 시간";
    }
  | {
      type: "soft-penalty";
      kind: SoftConstraintKind;
      penalty: number;
      publicLabel: string;
    };

export type Participant = {
  id: string;
  name: string;
  role: string;
  isOrganizer: boolean;
  defaultAttendanceType: AttendanceType;
  contextSummary?: string;
  schedule: Record<TimeSlotId, SlotState>;
};

export type TimeSlotId =
  | "mon-10"
  | "mon-16"
  | "tue-13"
  | "wed-15"
  | "thu-10"
  | "thu-15"
  | "fri-11"
  | "fri-16";

export type TimeSlot = {
  id: TimeSlotId;
  startAt: string;
  endAt: string;
  dateLabel: string;
  timeLabel: string;
};

export type ResponseOverride = "approved" | "declined";

export type ResponseOverrides = Partial<
  Record<string, Partial<Record<TimeSlotId, ResponseOverride>>>
>;
```

Use timezone-aware ISO strings or one consistent local-time convention.

Recommended timezone:

```text
Asia/Seoul
```

---

# 4. Participant data

Use these six participants.

```ts
export const participants: Participant[] = [
  {
    id: "minji",
    name: "김민지",
    role: "PO",
    isOrganizer: true,
    defaultAttendanceType: "required",
    contextSummary: "주최자 · 필수 참석",
    schedule: {},
  },
  {
    id: "jihoon",
    name: "이지훈",
    role: "백엔드 개발자",
    isOrganizer: false,
    defaultAttendanceType: "required",
    contextSummary: "개인 보호 시간 있음",
    schedule: {},
  },
  {
    id: "seoyeon",
    name: "박서연",
    role: "프로덕트 디자이너",
    isOrganizer: false,
    defaultAttendanceType: "required",
    contextSummary: "점심 직후 회피",
    schedule: {},
  },
  {
    id: "doyoon",
    name: "최도윤",
    role: "보안 분석가",
    isOrganizer: false,
    defaultAttendanceType: "required",
    contextSummary: "화·목 외근",
    schedule: {},
  },
  {
    id: "yujin",
    name: "정유진",
    role: "데이터 분석가",
    isOrganizer: false,
    defaultAttendanceType: "optional",
    schedule: {},
  },
  {
    id: "hyunwoo",
    name: "한현우",
    role: "운영 담당자",
    isOrganizer: false,
    defaultAttendanceType: "optional",
    contextSummary: "수요일 오후 고객 대응",
    schedule: {},
  },
];
```

Do not expose exact private calendar titles in the UI.

Only public, abstracted labels may be surfaced:

- 개인 보호 시간
- 외근
- 점심 직후 회피
- 고객 대응
- 연속 회의

---

# 5. Candidate time slots

Use this deterministic set for the prototype engine.

```ts
export const candidateSlots: TimeSlot[] = [
  {
    id: "mon-10",
    startAt: "2026-07-13T10:00:00+09:00",
    endAt: "2026-07-13T11:00:00+09:00",
    dateLabel: "7월 13일 월요일",
    timeLabel: "오전 10:00–11:00",
  },
  {
    id: "mon-16",
    startAt: "2026-07-13T16:00:00+09:00",
    endAt: "2026-07-13T17:00:00+09:00",
    dateLabel: "7월 13일 월요일",
    timeLabel: "오후 4:00–5:00",
  },
  {
    id: "tue-13",
    startAt: "2026-07-14T13:00:00+09:00",
    endAt: "2026-07-14T14:00:00+09:00",
    dateLabel: "7월 14일 화요일",
    timeLabel: "오후 1:00–2:00",
  },
  {
    id: "wed-15",
    startAt: "2026-07-15T15:00:00+09:00",
    endAt: "2026-07-15T16:00:00+09:00",
    dateLabel: "7월 15일 수요일",
    timeLabel: "오후 3:00–4:00",
  },
  {
    id: "thu-10",
    startAt: "2026-07-16T10:00:00+09:00",
    endAt: "2026-07-16T11:00:00+09:00",
    dateLabel: "7월 16일 목요일",
    timeLabel: "오전 10:00–11:00",
  },
  {
    id: "thu-15",
    startAt: "2026-07-16T15:00:00+09:00",
    endAt: "2026-07-16T16:00:00+09:00",
    dateLabel: "7월 16일 목요일",
    timeLabel: "오후 3:00–4:00",
  },
  {
    id: "fri-11",
    startAt: "2026-07-17T11:00:00+09:00",
    endAt: "2026-07-17T12:00:00+09:00",
    dateLabel: "7월 17일 금요일",
    timeLabel: "오전 11:00–12:00",
  },
  {
    id: "fri-16",
    startAt: "2026-07-17T16:00:00+09:00",
    endAt: "2026-07-17T17:00:00+09:00",
    dateLabel: "7월 17일 금요일",
    timeLabel: "오후 4:00–5:00",
  },
];
```

---

# 6. Mock schedule matrix

Populate each participant's `schedule` from this matrix.

Legend:

```text
F       free
H       hard-busy
P       protected, requestable
S1      soft penalty 1
S2      soft penalty 2
S3      soft penalty 3
```

| Participant | mon-10 | mon-16 | tue-13 | wed-15 | thu-10 | thu-15 | fri-11 | fri-16 |
|---|---|---|---|---|---|---|---|---|
| 김민지 | H | F | F | F | H | F | F | H |
| 이지훈 | F | H | F | H | F | P | F | F |
| 박서연 | F | F | S3 | H | F | F | P | F |
| 최도윤 | H | S2 | H | H | H | S1 | S2 | F |
| 정유진 | F | F | H | F | H | F | F | F |
| 한현우 | H | F | F | H | F | F | F | P |

Use these public labels:

```ts
const scheduleLabels = {
  minji: {
    "mon-10": "분기 계획 회의",
    "thu-10": "로드맵 회의",
    "fri-16": "제품 데모",
  },
  jihoon: {
    "mon-16": "개발 일정",
    "wed-15": "아키텍처 리뷰",
    "thu-15": "개인 보호 시간",
  },
  seoyeon: {
    "tue-13": "점심 직후 회피",
    "wed-15": "사용자 인터뷰",
    "fri-11": "개인 보호 시간",
  },
  doyoon: {
    "mon-10": "보안 점검",
    "mon-16": "연속 회의",
    "tue-13": "외근",
    "wed-15": "고객사 현장 방문",
    "thu-10": "외근",
    "thu-15": "외근 이후 이동",
    "fri-11": "연속 회의",
  },
  yujin: {
    "tue-13": "분석 일정",
    "thu-10": "리포트 리뷰",
  },
  hyunwoo: {
    "mon-10": "고객 대응",
    "wed-15": "고객 대응",
    "fri-16": "개인 보호 시간",
  },
};
```

Internal labels may be more specific in code, but only the following abstracted values should be returned to UI:

```text
외근
외근 이후 이동
개인 보호 시간
점심 직후 회피
고객 대응
연속 회의
일정 있음
```

---

# 7. Apply response overrides

Create a pure function.

```ts
function getEffectiveSlotState(
  participant: Participant,
  slotId: TimeSlotId,
  overrides: ResponseOverrides
): SlotState
```

Rules:

## Approved

If a protected slot is approved:

```text
protected → free
```

Approval applies only to the exact participant and exact slot.

## Declined

If a protected slot is declined:

```text
protected → hard-busy
```

Decline applies only to the exact participant and exact slot.

## Invalid override

Do not apply approval/decline to unrelated free or hard-busy slots.

---

# 8. Participant impact output

The engine must return a person-level impact for the selected time.

```ts
export type ParticipantImpactStatus =
  | "required-available"
  | "required-confirmation"
  | "required-available-with-note"
  | "optional-available"
  | "optional-unavailable"
  | "optional-available-with-note";

export type ParticipantImpact = {
  participantId: string;
  name: string;
  attendanceType: AttendanceType;
  status: ParticipantImpactStatus;
  label: string;
  publicContext?: string;
};
```

Examples:

```text
김민지 · 필수 · 가능
이지훈 · 필수 · 확인 필요 · 개인 보호 시간
박서연 · 필수 · 선호 반영
최도윤 · 필수 · 외근 이후 가능
정유진 · 선택 · 가능
한현우 · 선택 · 참석 어려움
```

Do not return private event titles to this UI-facing object.

---

# 9. Slot evaluation model

```ts
export type SlotEvaluation = {
  slot: TimeSlot;

  requiredHardConflictCount: number;
  requiredConfirmationTargets: Array<{
    participantId: string;
    name: string;
    publicLabel: string;
  }>;

  requiredSoftPenalty: number;
  optionalAvailableCount: number;
  optionalTotalCount: number;
  optionalSoftPenalty: number;

  participantImpacts: ParticipantImpact[];

  reasonRows: Array<{
    key:
      | "required"
      | "confirmation"
      | "travel"
      | "preference"
      | "optional";
    label: string;
    value: string;
  }>;
};
```

---

# 10. Evaluation rules

Implement as a pure function.

```ts
function evaluateSlot(params: {
  slot: TimeSlot;
  participants: Participant[];
  attendanceTypes: Record<string, AttendanceType>;
  responseOverrides: ResponseOverrides;
}): SlotEvaluation
```

## Required participant

### `hard-busy`

- increment `requiredHardConflictCount`
- slot is not confirmable

### `protected`

- add participant to `requiredConfirmationTargets`
- do not count as hard conflict

### `soft-penalty`

- participant is available
- add penalty to `requiredSoftPenalty`
- create an impact note

### `free`

- participant is available

## Optional participant

### `free`

- increment `optionalAvailableCount`

### `soft-penalty`

- increment `optionalAvailableCount`
- add penalty to `optionalSoftPenalty`

### `hard-busy` or `protected`

- participant is unavailable
- do not create a confirmation target
- optional participants must never block meeting confirmation

This rule is critical:

> Never ask an optional participant to move a protected schedule solely to create a valid meeting time.

---

# 11. Recommendation result model

```ts
export type MeetingRecommendation =
  | {
      status: "READY";
      evaluation: SlotEvaluation;
    }
  | {
      status: "NEED_CONFIRMATION";
      evaluation: SlotEvaluation;
      confirmationTargets: SlotEvaluation["requiredConfirmationTargets"];
    }
  | {
      status: "NO_OPTION";
      evaluations: SlotEvaluation[];
      blockingSummary: string;
    };
```

`NEXT_ALTERNATIVE` does not need to be a separate engine status.

It is a presentation state created when:

1. a previous protected slot is declined
2. the engine recomputes
3. a different slot is recommended

The engine result remains `READY` or `NEED_CONFIRMATION`.

The UI may label it as a next alternative.

---

# 12. Ranking rules

Do not use one opaque weighted total score.

Use an explainable lexicographic comparator.

## Step 1 — hard filtering

```ts
const valid = evaluations.filter(
  (evaluation) => evaluation.requiredHardConflictCount === 0
);
```

If no valid slot exists:

```text
NO_OPTION
```

## Step 2 — sort valid slots

Sort in this exact priority:

1. fewer required confirmation targets
2. lower required soft penalty
3. more optional participants available
4. lower optional soft penalty
5. earlier chronological start time

Equivalent score vector:

```ts
[
  requiredConfirmationTargets.length,
  requiredSoftPenalty,
  -optionalAvailableCount,
  optionalSoftPenalty,
  startTimestamp,
]
```

Use a comparator, not a summed weighted score.

## Step 3 — result status

```text
0 required confirmations
→ READY

1 or more required confirmations
→ NEED_CONFIRMATION
```

The UI currently shows one confirmation at a time.

If the winning slot has multiple confirmation targets:

- preserve all targets in the engine output
- expose `confirmationCount`
- the UI may request the first target first
- do not discard the rest

---

# 13. Recommendation API

```ts
export function recommendMeeting(params: {
  participants: Participant[];
  candidateSlots: TimeSlot[];
  attendanceTypes: Record<string, AttendanceType>;
  responseOverrides: ResponseOverrides;
}): MeetingRecommendation
```

Properties:

- pure
- deterministic
- no UI dependency
- no `scenarioId` dependency
- no mutable singleton state
- same input always returns same output

---

# 14. Dynamic role changes

The participant setup UI must be wired to engine inputs.

## Organizer

```text
김민지
주최자 · 필수 참석
```

- required
- locked
- cannot become optional

## Other 5 participants

- can switch between required and optional
- row positions remain fixed
- every change updates the count summary immediately

Example:

```text
필수 4명 · 선택 2명
```

## Search action

When the user selects `이 조건으로 시간 찾기`:

1. read current attendance types
2. clear pending request state
3. clear response overrides from any previous run
4. call `recommendMeeting`
5. route based on the calculated result

Do not route based on the scenario preset.

---

# 15. Scenario presets

Presets are allowed only as initial input seeds.

```ts
export type ScenarioPresetId =
  | "coordination"
  | "ready"
  | "rejected";
```

## Coordination preset

```ts
attendanceTypes = {
  minji: "required",
  jihoon: "required",
  seoyeon: "required",
  doyoon: "required",
  yujin: "optional",
  hyunwoo: "optional",
};

responseOverrides = {};
```

Expected engine result:

```text
NEED_CONFIRMATION
thu-15
confirmation target: 이지훈
```

## Ready preset

```ts
attendanceTypes = {
  minji: "required",
  jihoon: "optional",
  seoyeon: "required",
  doyoon: "required",
  yujin: "optional",
  hyunwoo: "optional",
};

responseOverrides = {};
```

Expected engine result:

```text
READY
thu-15
```

## Rejected preset

```ts
attendanceTypes = coordinationPreset.attendanceTypes;

responseOverrides = {
  jihoon: {
    "thu-15": "declined",
  },
};
```

Expected engine result:

```text
NEED_CONFIRMATION
fri-11
confirmation target: 박서연
```

A preset must not contain a precomputed recommendation object.

---

# 16. Approval and decline flow

## Approval

When 이지훈 approves `thu-15`:

```ts
responseOverrides.jihoon["thu-15"] = "approved";
```

Then call `recommendMeeting` again.

Expected:

```text
READY
thu-15
```

## Decline

When 이지훈 declines `thu-15`:

```ts
responseOverrides.jihoon["thu-15"] = "declined";
```

Then call `recommendMeeting` again.

Expected:

```text
NEED_CONFIRMATION
fri-11
confirmation target: 박서연
```

Do not navigate to a hardcoded next-alternative object.

---

# 17. UI wiring in this patch

Do not redesign the cards yet.

Only replace static strings and counts with calculated engine output.

Wire these fields dynamically:

- date
- time
- result status
- required available count
- required total count
- optional available count
- optional total count
- confirmation target
- confirmation count
- person-level impacts
- reason rows
- next recommendation after decline

If a current UI area cannot display a new field yet, keep the field in engine output for the next design patch.

---

# 18. No-option behavior

The live default dataset may not naturally produce `NO_OPTION` for every role combination.

The engine must still support it.

Return `NO_OPTION` when every candidate slot has at least one required hard conflict.

Include:

```ts
blockingSummary:
  "현재 조건으로는 다음 주 안에 필수 참석자가 모두 가능한 1시간을 찾을 수 없어요."
```

Do not invent a valid time.

Do not silently ignore a required hard conflict.

---

# 19. Tests

Use the existing test runner.

If none exists, add the lightest test setup compatible with the current stack.

## 19.1 Unit tests

Test `getEffectiveSlotState`.

- protected + approved → free
- protected + declined → hard-busy
- unrelated slot override has no effect

Test `evaluateSlot`.

- required hard-busy increments hard conflict
- required protected creates confirmation target
- optional protected does not create confirmation target
- optional hard-busy does not block the slot
- soft penalty participant remains available

Test `recommendMeeting`.

- default coordination preset → `thu-15`, `NEED_CONFIRMATION`, 이지훈
- ready preset → `thu-15`, `READY`
- rejected preset → `fri-11`, `NEED_CONFIRMATION`, 박서연
- approval → same slot becomes `READY`
- decline → recommendation changes
- same input returns same result
- no valid slot returns `NO_OPTION`

## 19.2 All 32 attendance-role combinations

Organizer is fixed required.

Iterate every required/optional combination for the remaining 5 participants.

```ts
for (let mask = 0; mask < 32; mask += 1) {
  // create attendanceTypes
  // call recommendMeeting
}
```

For every result:

- no exception is thrown
- result is defined
- if result is not `NO_OPTION`, selected slot has `requiredHardConflictCount === 0`
- `requiredTotal` matches selected roles
- `optionalTotal` matches selected roles
- optional protected schedules never become confirmation targets
- organizer remains required

Do not snapshot only screen strings.

Test domain outputs.

## 19.3 Regression test

Changing one participant from required to optional must be able to change:

- recommendation status
- selected time
- confirmation target
- optional availability count

This test prevents a return to static scenario behavior.

---

# 20. Development-only verification

A hidden debug output is allowed, but do not add visible product UI in this patch.

Recommended:

```text
?debug=1
```

Show or log:

- current attendance types
- selected slot
- engine status
- score vector
- confirmation targets
- required hard conflict count
- participant impacts

Default review and user-test URLs must not display debug information.

---

# 21. Forbidden changes in this patch

Do not:

- redesign the landing page
- redesign DecisionCard
- add the new wide Decision Surface yet
- add new animations
- add people search
- add calendar grid
- add Top 3 recommendations
- add a weighted-score control
- add AI copy
- add new meeting-note features
- add partial attendance
- change the product color system
- directly map `scenarioId` to a result object

This patch is complete only when the product result is generated by rules.

---

# 22. Suggested file structure

Adapt to the existing architecture.

```text
src/
  features/
    meeting-decision/
      engine/
        decision-engine.ts
        decision-engine.types.ts
        decision-engine.test.ts
      data/
        participants.ts
        candidate-slots.ts
        schedule-fixtures.ts
        scenario-presets.ts
      state/
        meeting-decision.store.ts
```

Keep the decision engine independent from React components.

---

# 23. Implementation order

1. identify and remove direct scenario-result branching
2. define domain types
3. build candidate slots and schedule fixtures
4. implement response override resolution
5. implement slot evaluation
6. implement lexicographic ranking
7. implement recommendation API
8. connect participant role controls
9. connect approval and decline recomputation
10. replace static result strings with engine output
11. add tests
12. run all 32 role combinations
13. run TypeScript, lint, test, and build

---

# 24. Acceptance criteria

The patch passes when:

- changing required/optional roles can change the actual result
- organizer stays required
- no participant row moves because of role changes
- no scenario directly returns a precomputed result
- default preset produces a confirmation request for 이지훈
- making 이지훈 optional produces a ready result
- approving 이지훈's protected time produces a ready result
- declining it produces the next recommendation for 박서연
- optional protected time never blocks confirmation
- required hard-busy time is never recommended
- all 32 role combinations execute without runtime errors
- `NO_OPTION` is supported
- TypeScript passes
- lint passes
- tests pass
- build passes

---

# 25. Report after implementation

Return:

1. architecture summary
2. files created
3. files modified
4. removed hardcoded scenario branches
5. recommendation comparator
6. test results
7. 32-combination test summary
8. screenshots or text output for:
   - default coordination
   - ready preset
   - approval
   - decline and next recommendation
   - one user-edited role combination
9. any requirement that could not be implemented
