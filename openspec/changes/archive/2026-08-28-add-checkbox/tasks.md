# Tasks: add-checkbox

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~550–650 (component ~150, styles ~80, spec ~250, stories ~180) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 standalone core → PR 2 FormField integration |
| Delivery strategy | ask-on-risk |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Standalone checkbox: CVA, indeterminate, styles | PR 1 | `npm run test -- checkbox` | Storybook `Default` story | Revert branch; no shared files touched except barrels |
| 2 | FormField integration + full stories | PR 2 | `npm run test -- checkbox form-field` | Storybook `InsideFormField`/`ErrorState` | Revert unit-2 files only |

## Phase 1: RED Tests — Standalone Core (strict TDD)

- [x] 1.1 Create `src/lib/forms/checkbox/checkbox.spec.ts` with harness importing ReactiveFormsModule; write failing tests for Selection State scenarios (click toggles once; Space on focused toggles).
- [x] 1.2 Add failing CVA tests: `setValue(true)` renders checked; user check fires `onChange(true)`; blur marks touched; `disable()` blocks interaction.
- [x] 1.3 Add failing indeterminate tests: `[indeterminate]` shows visual, control value stays boolean; user click clears visual and checks; `writeValue` while indeterminate syncs visual without firing onChange.

## Phase 2: Standalone Component (GREEN)

- [x] 2.1 Create `src/lib/forms/checkbox/checkbox.ts`: component `bursit-checkbox`, inputs `checked`/`disabled` models, `indeterminate`/`required`/`validationInteraction` inputs, host classes `.bursit-checkbox -checked -indeterminate -disabled -focused`.
- [x] 2.2 Implement ControlValueAccessor in same file (`writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState`).
- [x] 2.3 Create `src/lib/forms/checkbox/checkbox.html`: native `<input type="checkbox">` + `<ng-content>` label area with explicit id/for association.
- [x] 2.4 Bind `[indeterminate]` directly as property binding on the input (DOM property, not attribute — no effect/viewChild needed); no special-case click logic (native behavior clears + toggles).
- [x] 2.5 Style `src/lib/forms/checkbox/checkbox.scss` (via existing styleUrl) consuming only `--checkbox-*` tokens — component-encapsulated, matching select/icon/modal convention. No global sheet needed.
- [x] 2.6 Export barrel in `src/lib/forms/index.ts`; make Phase 1 tests pass (`npm run test -- checkbox`).

## Phase 3: RED Tests — FormField Integration

- [x] 3.1 Add failing tests: inside `<bursit-form-field>`, invalid required checkbox applies error class and wires `aria-describedby="${fieldId}-error ${fieldId}-message"`; `disabled()` propagates disabled field class.

## Phase 4: FormField Integration (GREEN)

- [x] 4.1 Provide component as `FormFieldControl` via `forwardRef`; implement `invalid`, `disabled`, `required`, `focused`, `hovered`, `control` members only.
- [x] 4.2 Inject `FORM_FIELD_ID` (optional); wire input `id` + `aria-describedby` when user has not set them.
- [x] 4.3 Inject NgControl `@Self() @Optional()`; subscribe `statusChanges` to sync invalid/disabled signals (reuse InputDirective's queueMicrotask blur pattern if touched-based validation needed).

## Phase 5: Stories + Verification

- [x] 5.1 Create `src/lib/forms/checkbox/checkbox.stories.ts`: Default, Disabled, Required, ErrorState, Indeterminate, InsideFormField, Playground (mirror input/select structure).
- [x] 5.2 Run full `npm run test` — all suites green, coverage ≥ 80% for new files.
- [x] 5.3 Run `npm run build`; visually verify Storybook states (checked/unchecked/indeterminate/error/disabled/focus ring).

Delivery strategy resolved: user chose 2 chained PRs, strategy `stacked-to-main` (each PR merges to master in order; PR 1 = Phases 1–2 + standalone stories subset, PR 2 = Phases 3–5).
