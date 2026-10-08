# Feature — Forms A11Y Test Hardening

## Objective

Close the verification gap over accessibility wiring that already ships, and fix the
three defects that gap hides.

## Problem

`openspec/changes/archive/2026-06-18-fix-forms-a11y-and-tests` was archived with its
`tasks.md` still describing only Phase 1 (the `createWithControl()` test fix, verified
complete). Phases 2 and 3 — ARIA wiring and the three stories — were implemented but
never written into `tasks.md`, and neither ever got a test asserting them.

The result is working, untested accessibility wiring:

| Surface | Implemented at | Asserted by a test? |
| --- | --- | --- |
| `aria-required`, `aria-invalid` on input | `input.directive.ts:26-27` | no |
| `aria-describedby` on input | `input.directive.ts:106-114` | no |
| `role="group"` on form-field | `form-field.ts:28` | no |
| label `for` / `id` inside a form-field | `label.directive.ts:12-22` | no (negative case only) |
| `ErrorState`, `ValidationInteractionTouched`, `FloatingLabel` stories | `input.directive.stories.ts:217,253,284` | n/a (undocumented in `tasks.md`) |

The missing tests conceal three real defects (see Constraints).

## Defects this change fixes

1. **`aria-invalid` value inconsistency.** Input binds the raw boolean
   (`input.directive.ts:27`), so a valid input emits `aria-invalid="false"`. Checkbox
   uses `invalid() ? 'true' : null` and select uses `invalid() || null`, so both emit
   nothing when valid. A healthy input currently announces itself as invalid to
   assistive technology.
2. **Dangling `aria-describedby`.** `input.directive.ts:111` always writes
   `` `${id}-error ${id}-message` `` even when no `<span bursitError>` or
   `<span bursitMessage>` is projected, leaving `aria-describedby` pointing at IDs
   that do not exist.
3. **No `aria-labelledby` on input.** `select.ts:291-293` wires it; input does not. An
   input used standalone (see the `StandaloneTemplate` story,
   `input.directive.stories.ts:100-103`) has no accessible name.

## Constraints

- **Do not change public behaviour beyond the three defects.** This is a hardening
  change, not a redesign.
- **`aria-invalid` must stay consistent with checkbox and select**: emit the attribute
  only when true, never `"false"`.
- **`aria-describedby` must reference only projected elements.** Build the value from
  what is actually present rather than hardcoding both IDs.
- **Reuse the existing `FORM_FIELD_ID` token** (`form-field-id.token.ts:4-8`) and the
  existing `${fieldId}-error` / `${fieldId}-message` conventions. Do not introduce a
  second ID counter; the tooltip directive has its own and unifying them is out of scope.
- **Tokens 2.0.0**: `--space-2xs` no longer exists. Not part of this change — tracked
  separately because it is an unrelated live regression in `src/styles/_label.scss:7`.
- **`aria-required` stays as-is.** Unlike `aria-invalid`, `aria-required="false"` is
  valid and meaningful ARIA, so it must not be coerced to absent.

## Tasks

All complete. Verified by the parent, not only by the writer.

- [x] **T1 — RED: lock current input ARIA behaviour with failing tests.**
      11 new specs under `InputDirective — ARIA contract`. Observed RED:
      `Tests: 6 failed, 9 passed, 15 total`, with real output
      `expect(received).toBeNull() / Received: "false"` and
      `Expected: "bursit-field-5-message" / Received: "bursit-field-5-error bursit-field-5-message"`.

- [x] **T2 — GREEN: `aria-invalid` coercion.**
      `input.directive.ts` host binding now `invalid() ? true : null`.
      `aria-required` deliberately left raw, with a comment recording why.

- [x] **T3 — GREEN: `aria-describedby` from projected elements only.**
      New `_wireAriaDescribedBy` / `_syncAriaDescribedBy`, querying `[bursitError]` and
      `[bursitMessage]` inside the closest `bursit-form-field`. Author-supplied
      `aria-describedby` is captured at init and adopted if the author changes it later.

- [x] **T4 — `role="group"` and label `for` / `id` locked.**
      `form-field.spec.ts` asserts the role on the bare host and with a projected select.
      `label.directive.spec.ts` asserts `for`, `id === ${for}-label`, and `for === input.id`.

- [x] **T5 — `aria-labelledby` deliberately NOT added.**
      Resolved from evidence, not in advance. Inside a `bursit-form-field` the label's
      `for` already supplies a valid accessible name, so `aria-labelledby` would be
      redundant; the standalone story has no label at all, so wiring it needs a new
      public input. Recorded as a follow-up instead.

- [x] **T6 — full suite and build.**

## Verification

| Command (from `projects/bursit-angular` unless noted) | Observed |
| --- | --- |
| `npx jest --config ../../jest.config.js --testPathPatterns "input.directive.spec"` (RED) | 6 failed, 9 passed, 15 total |
| same command, after T2/T3 (GREEN) | **17 passed, 17 total** |
| `npx jest --config ../../jest.config.js --testPathPatterns "form-field.spec\|label.directive.spec"` | **11 passed, 11 total**, 2 suites |
| `npm run test` (from repo **root**) | **27 passed / 27 total**, 2 skipped, 340 passed, 342 total |
| `npm run build` (from repo **root**) | succeeded, output to `dist/bursit-angular` |

Parent re-ran the three Jest commands independently and reproduced 17/17, 11/11 and
27 suites / 340 passed / 2 skipped / exit 0. Coverage 94.94 stmts, 82.31 branch;
`input.directive.ts` 93.18 stmts / 84.09 branch — the 80% threshold still holds.

## Corrections to this document

The writer contradicted this plan in three places. The plan was wrong; the record is:

1. **Test and build commands run from the repository ROOT**, not from
   `projects/bursit-angular/`. That directory has no `package.json` and no `test`
   script, so `npm run test` there fails with `Missing script: "test"`. Only the
   `npx jest --config ../../jest.config.js` invocations work from the library directory.
2. **T3's premise was false.** This document said to "determine projection the same way
   the existing code already detects error/message presence". No such mechanism exists —
   `checkbox.ts` hardcodes `${fieldId}-error` and `select.ts:309` hardcodes both ids.
   The first real projection detection was implemented here, scoped to the input.
3. **T5's premise was half true.** A standalone input has no accessible name, but an
   input inside a form-field already gets one from the label's `for`.

## Follow-ups found, not fixed

- **`select.ts:309` has the same dangling `aria-describedby` defect** this change fixed
  on input, and `select.ts:289-294` writes `aria-labelledby` unconditionally. Outside
  the allowed edit surfaces; the next change should mirror this one onto select.
- `error.component.ts:18` has no spec twin (`message.component.spec.ts` exists).
- `--space-2xs` removed from `bursit-ui-tokens` 2.0.0 but still consumed at
  `src/styles/_label.scss:7` — live regression, unrelated to accessibility.
- All four touched files already failed `prettier --check` on `HEAD`. Pre-existing drift
  was left alone to avoid unrelated diff noise; only newly added lines were formatted.

## Acceptance criteria

- [x] `input.directive.spec.ts` asserts the full corrected ARIA contract (11 specs).
- [x] A valid input emits **no** `aria-invalid` attribute — asserted by test, not inspection.
- [x] `aria-describedby` references only IDs that exist in the rendered DOM.
- [x] `form-field.spec.ts` asserts `role="group"`.
- [x] `label.directive.spec.ts` asserts the positive `for` / `id` case.
- [x] `npm run test` full suite green — 27 suites, 340 passed, 2 skipped, no regressions.
- [x] `npm run build` succeeds.

## Part 2 — select parity (same branch)

The same dangling-`aria-describedby` defect existed on `select.ts:307-309`, which
hardcoded both ids. Fixed, and the id-resolution extracted so there is exactly one
implementation instead of two copies.

### Added

- `forms/aria-describedby.ts` — new pure `resolveAriaDescribedBy(fieldEl, fieldId)`.
  No Angular imports, unit-testable with plain DOM. Extracted from `input.directive.ts`.
- `forms/aria-describedby.spec.ts` — 10 specs, no TestBed.
- `forms/select/select.spec.ts:1233-1379` — new `AriaHostComponent` plus 8 specs.

### Changed

- `forms/select/select.ts:305-317` — `_wireAriaDescribedBy()` now bails when the trigger
  already carries `aria-describedby`, then resolves through the helper and sets the
  attribute only when non-null.
- `forms/input/input.directive.ts:128-136` — pure move onto the helper, no behaviour
  change. The `!fieldEl` early return is subsumed by the helper's own guard.

### Not touched, deliberately

- `select.ts:288-295` `aria-labelledby` — already correctly guarded against an existing
  `aria-label` and `aria-labelledby`. An earlier exploration report wrongly called it
  unconditional; re-reading the source proved otherwise.
- `select.html:11-12` `aria-required` / `aria-invalid` — already `|| null`.

### Verification

| Command | Observed |
| --- | --- |
| New select specs, before the fix (RED) | 4 failed, 81 passed, 85 total |
| `select.spec` + `aria-describedby.spec` after (GREEN) | **95 passed, 95 total** |
| `input.directive.spec` regression gate | **17 passed** — unchanged from baseline |
| `npm run test` (repo root) | **28 suites passed**, 2 skipped, 358 passed, 360 total |
| `npm run build` (repo root) | succeeded |

The RED case that proves the defect is not theoretical: with a valid control, the DOM had
no `#bursit-field-8-error` while the attribute still read
`"bursit-field-8-error bursit-field-8-message"`.

## Open defect — duplicate DOM ids (found, verified, NOT fixed)

`form-field.html:8` stamps `[id]="fieldId + '-error'"` on the slot **wrapper div**, and
`error.component.ts:19` stamps the **same** id on the projected element. Same for message
at `form-field.html:12` and `message.component.ts:19`.

So when an author projects `<span bursitError>` without an explicit `id`, the DOM ships
two elements with `id="bursit-field-N-error"`. That is invalid HTML, and it makes
`aria-describedby` resolve ambiguously — `getElementById` returns the first match, which is
the **empty wrapper**, not the error text.

This is arguably worse than the dangling reference this feature set out to fix: a dangling
id is announced as missing, whereas a duplicate is resolved to the wrong (empty) element.

Two candidate resolutions, not yet decided:

1. Drop the ids from the wrapper divs in `form-field.html`, leaving them only on the
   projected components. One file, but an empty slot then carries no id at all.
2. Drop the ids from `error.component.ts` / `message.component.ts`, leaving them on the
   wrappers. Two files, but the wrapper always exists while the field is invalid, so the
   reference is stable even when the author projects nothing.

Needs a decision before implementation.

## Part 3 — checkbox parity (same branch)

The last control still hardcoding a describedby id was `checkbox.ts:129-138`, which wrote
`${fieldId}-error` unconditionally. Migrated onto the same shared helper, so all three
controls now resolve describedby through one implementation.

### Changed

- `forms/checkbox/checkbox.ts:130-141` — `_wireAriaDescribedBy()` now mirrors
  `select.ts:306-318` exactly: early-return when the input already carries
  `aria-describedby`, then `closest('bursit-form-field')` → `resolveAriaDescribedBy()`,
  and set the attribute only when the result is non-null. The `!el` arm is the one
  deliberate difference from select: `inputEl()` is a `viewChild` that can be undefined,
  whereas select's `trigger()` is non-optional.
- `forms/checkbox/checkbox.spec.ts` — `createFormFieldHost()` gained an optional third
  `slots` argument so a host can project `[bursitError]` / `[bursitMessage]`; existing
  call sites are unchanged and default to projecting nothing.

### A test that encoded the bug

`checkbox.spec.ts:177-186` asserted `aria-describedby === "${fieldId}-error"` from a host
projecting **neither** slot. The assertion was wrong, not the intent: it is what kept the
defect alive. Rewritten to `should NOT set aria-describedby when neither an error nor a
message is projected`, asserting the attribute is absent.

### Added — 8 specs

| Spec | Proves |
| --- | --- |
| nothing projected | attribute absent |
| error only | exactly `${fieldId}-error`, and `#${fieldId}-error` resolves |
| message only | exactly `${fieldId}-message`, and `#${fieldId}-message` resolves |
| both | exactly `${fieldId}-error ${fieldId}-message`, both ids resolve |
| error projected, control valid | attribute absent, error slot not rendered |
| both projected | every id in the attribute resolves via `fieldEl.querySelector('#'+id)` |
| author-provided value | untouched after re-running `ngAfterViewInit()` |
| used outside a form-field | attribute absent (covers the `fieldEl === null` branch) |

Every id assertion resolves against the rendered DOM rather than only string-comparing
the attribute, so a dangling reference cannot pass.

### RED evidence (before the `checkbox.ts` change)

`6 failed, 13 passed, 19 total`. Real diffs:

```
● should NOT set aria-describedby when neither an error nor a message is projected
  expect(received).toBeNull()
  Received: "bursit-field-5-error"

● should not emit aria-describedby when neither error nor message is projected
  expect(received).toBeNull()
  Received: "bursit-field-7-error"

● should reference only the message id when a message is projected
  Expected: "bursit-field-9-message"
  Received: "bursit-field-9-error"

● should reference both ids when an error and a message are projected
  Expected: "bursit-field-10-error bursit-field-10-message"
  Received: "bursit-field-10-error"

● should not reference the error id while the control is valid, even if an error is projected
  expect(received).toBeNull()
  Received: "bursit-field-11-error"

● should only reference ids that exist in the rendered DOM
  Expected: 2
  Received: 1
```

Two of the new specs were green at RED and are regression locks rather than proof of the
defect: "reference only the error id" (the hardcoded value coincidentally matched) and
"not override an author-provided value" (the old code already had the user-override
guard). Both guard behaviour the refactor had to preserve.

### Verification

| Command | Observed |
| --- | --- |
| `checkbox.spec` baseline, before any edit | 12 passed, 12 total |
| `checkbox.spec` with new specs, before the fix (RED) | **6 failed**, 13 passed, 19 total |
| `checkbox.spec` after the fix (GREEN) | **20 passed**, 20 total |
| `input.directive.spec` regression gate | **17 passed** — unchanged from baseline |
| `select.spec` + `aria-describedby.spec` regression gate | **95 passed** — unchanged from baseline |
| `npm run test` (repo root) | **28 suites passed**, 2 skipped, 366 passed, 368 total |
| `npm run build` (repo root) | succeeded, exit 0, output to `dist/bursit-angular` |

Suite total moved 358 → 366 passed, exactly the 8 added specs; no test was deleted, so the
rewritten assertion is a correction rather than a swap. Coverage `checkbox.ts` 95.38 stmts
/ 79.16 branch (uncovered `103-107`, the mouseenter/mouseleave handlers, untouched here);
`aria-describedby.ts` stays at 100/100. Overall 95.15 stmts, 82.96 branch — the 80%
threshold holds.

### Note on the duplicate-id defect

The `formFieldEl.querySelector('#' + id)` assertions resolve against the **slot wrapper
div** stamped by `form-field.html:8`, which carries the same id as the projected element
(`error.component.ts:19`). So these specs prove the reference is not dangling; they do not
prove it resolves to the error *text*. The duplicate-id defect recorded below is still
open and still unaddressed.

### Prettier

Both touched files already failed `prettier --check` on `HEAD`. Pre-existing drift was left
alone to avoid unrelated diff noise; only lines written or edited here were matched to
Prettier output. The remaining violations are all on untouched `HEAD` lines — the
over-100-char `@angular/core` import, `"checked()"` double quotes, a missing semicolon on
`this._wireAriaDescribedBy()`, and the pre-existing multi-line `<bursit-checkbox>` template
markup in `createFormFieldHost()`.

## Part 4 - select keeps aria-describedby current (same branch)

Part 2 made select's initial `aria-describedby` correct but left it a one-shot value:
`ngAfterViewInit()` called `_wireAriaDescribedBy()` exactly once and it could only ever
SET the attribute. The answer genuinely changes at runtime, because the error
`<ng-content>` sits inside an `@if` on validity in `form-field.html:7-11` — when the
control is valid the wrapper does not render, so the projected `[bursitError]` element is
absent from the DOM. A select that started valid and later went invalid kept its stale
value and the error text was never announced; the reverse left a reference to an id that
no longer existed.

### Changed

- `forms/select/select.ts` - constructor registers
  `afterRenderEffect(() => { this.invalid(); this._syncAriaDescribedBy(); })`, mirroring
  `input.directive.ts:57-67`. `_wireAriaDescribedBy()` is guarded by
  `_userAriaDescribedBy` and only sets when non-null; new `_syncAriaDescribedBy()` does
  remove  clear  re-wire  record. `ngAfterViewInit` keeps `_wireId` and
  `_wireAriaLabelledBy` unchanged, and still wires describedby for the initial paint.
- The reactive dependency is the existing `invalid` signal, not a new one. It is already
  written from `_syncFromControl()` (subscribed to `control.statusChanges` at
  `ngAfterViewInit` time) and from the `validationInteraction`/`required` effect, so
  reading it inside the render effect registers exactly the signal that flips with
  validity. Verified by mutation: deleting the bare `this.invalid()` read leaves the
  effect with no dependency, it runs once, and the same two specs fail as in RED.
- No `implements` change and no new imports beyond `afterRenderEffect`.

### Added a guard the input version does not have

`_appliedAriaDescribedBy` is now also recorded at the end of `ngAfterViewInit()`. Without
it, a control that is already invalid at init has its own attribute adopted as "author
intent" by the first `_syncAriaDescribedBy()` run and then never updates again. This was
caught by the new removal spec, not by inspection — it failed against a faithful copy of
`input.directive.ts`.

**This latent bug is still present in `input.directive.ts` and `checkbox.ts`**: both wire
describedby at init without recording `_appliedAriaDescribedBy`, so a control that is
invalid on first render freezes its value permanently. `input.directive.spec.ts:190`
misses it because that spec starts from a VALID control, where the init wire resolves to
`null` and nothing is ever set. Out of the allowed edit surfaces here, so it is reported
rather than fixed.

### Added - 4 specs

| Spec | Proves | RED? |
| --- | --- | --- |
| should keep aria-describedby current when validity flips in both directions | valid → absent; invalid → `${fieldId}-error`; back to valid → REMOVED | yes |
| should keep aria-describedby current and referenced ids must resolve in the DOM | every referenced id resolves via `document.getElementById`; after the flip back the id resolves to `null` | yes |
| should remove a stale aria-describedby when an invalid control becomes valid | invalid at init → both ids wired; becoming valid drops only `-error`, keeps `-message` | yes |
| should not override an author-provided aria-describedby across validity transitions | author value survives every flip | **no - regression lock only** |

The fourth spec was already green before the change. The original code had an
`if (el.getAttribute('aria-describedby')) return` guard, so it never clobbered author
intent; the spec exists because the new remove-then-reapply path is a new way to destroy
that value and had to be proven not to. It proves nothing about the defect.

### RED evidence (before the `select.ts` change)

`3 failed, 1 passed` across the 4 new specs, measured by restoring `select.ts` from HEAD
via read-only `git show` and re-running each spec by name:

```
? should keep aria-describedby current when validity flips in both directions
  Expected: "bursit-field-0-error"
  Received: null

? should keep aria-describedby current and referenced ids must resolve in the DOM
  Expected: "bursit-field-0-error"
  Received: null

? should remove a stale aria-describedby when an invalid control becomes valid
  Expected: "bursit-field-0-message"
  Received: "bursit-field-0-error bursit-field-0-message"
```

The third failure is the reverse direction the old code could not express: the `-error`
slot un-rendered, `document.getElementById('...-error')` returned `null`, and the
attribute still pointed at it.

### Verification

| Command | Observed |
| --- | --- |
| `select.spec` baseline before any edit | 85 passed, 85 total |
| `select.spec` with the 4 new specs, before the fix (RED) | **3 failed**, 86 passed, 89 total |
| `select.spec` after the fix (GREEN) | **89 passed**, 89 total |
| `select.spec` + `aria-describedby.spec` | **99 passed**, 99 total |
| `input.directive.spec` regression gate | **17 passed** - unchanged from baseline |
| `checkbox.spec` regression gate | **20 passed** - unchanged from baseline |
| `npm run test` (repo root) | **28 suites passed**, 2 skipped, 370 passed, 372 total |
| `npm run build` (repo root) | succeeded, exit 0, output to `dist/bursit-angular` |

Suite total moved 366 → 370 passed, exactly the 4 added specs. No test was deleted or
weakened.

## Part 5 - checkbox tracks validity (same branch)

Same defect class as Part 4, fixed in `checkbox.ts`. Prior art for `select.ts`.

### Added

- `checkbox.ts:56-57` `_userAriaDescribedBy` / `_appliedAriaDescribedBy` fields — neither
  existed before.
- `checkbox.ts:75-77` `afterRenderEffect` in the constructor reading `this.invalid()` (the
  signal already present at `checkbox.ts:34`, fed by `_syncFromControl()` and by the blur
  handler) and calling `_syncAriaDescribedBy()`.
- `checkbox.ts:192` `_syncAriaDescribedBy()` — removes first, re-resolves, records.
- `checkbox.spec.ts` — 4 specs, `20 -> 24`.

### The init-recording trap, paid for twice

`ngAfterViewInit` must record `_appliedAriaDescribedBy` after wiring:

```ts
this._userAriaDescribedBy = el?.getAttribute('aria-describedby') ?? null;  // capture first
this._wireAriaDescribedBy();                                                // wire
this._appliedAriaDescribedBy = el?.getAttribute('aria-describedby') ?? null; // then record
```

Without the third line the first sync reads the component's own value back as author
intent, adopts it, and freezes. This bit `select.ts` during Part 4 and was carried into
Part 5 deliberately; the comment at `checkbox.ts:98-100` states why.

### Verification

| Command | Observed |
| --- | --- |
| New specs, `checkbox.ts` reverted to HEAD (**RED**) | **3 failed**, 21 passed, 24 total |
| `checkbox.spec` after (**GREEN**) | **24 passed**, 24 total |
| `select.spec` + `aria-describedby.spec` | **99 passed** — unchanged |
| `input.directive.spec` | **17 passed** — unchanged |
| `npm run test` (repo root) | 28 suites, 2 skipped, **374 passed**, 376 total |
| `npm run build` (repo root) | succeeded |

370 -> 374 is exactly the 4 added specs; nothing was deleted or weakened.

## Status of every open item in this document

| Item | Status |
| --- | --- |
| Dangling `aria-describedby` on input | **Fixed** (`95c2271`) |
| Dangling `aria-describedby` on select | **Fixed** (`7f8153f`) |
| Dangling `aria-describedby` on checkbox + a test that asserted it | **Fixed** (`e807e6f`) |
| select computed once at init, stale across validity flips | **Fixed** (`bf1d0ef`) |
| checkbox never re-synced across validity flips | **Fixed** (this part) |
| `input.directive.ts` latent freeze (`ngOnInit:98` does not record) | **Open** — latent only; slots are not projected at `ngOnInit`, so the resolver returns `null` and nothing is set to freeze. `input.directive.spec.ts:190` starts from a valid control and cannot observe it. |
| Duplicate DOM ids (wrappers vs projected components) | **Open** — invalid HTML and resolution fragility. Text is still read because the wrapper contains the projected content. |
| `--space-2xs` removed in tokens 2.0.0, consumed at `src/styles/_label.scss:7` | **Open, deliberately deprioritised** — user states bursit-tokens CI catches it. |

## Out of scope

- Fixing `--space-2xs` in `src/styles/_label.scss:7` (separate live regression from the
  tokens 2.0.0 bump).
- Adding `error.component.spec.ts` — `message.component.spec.ts` exists but
  `error.component.ts` has no spec twin. Worthwhile, but a separate change.
- Unifying the two independent ID counters (`form-field-id.token.ts` and
  `tooltip/tooltip.directive.ts:7`).
- Any SCSS, token, or visual change.

## Route

Delegated writer (4+ non-trivial files). Tests-first: T1 must observe RED before T2.