# Proposal: Fix Forms Module Tests and Complete Accessibility Coverage

## Intent

Two `InputDirective` tests fail because `createWithControl()` overrides `NgControl` to null, disconnecting the directive from `FormControl` state. The forms module also lacks `aria-describedby` wiring, label `for`, and `role="group"` — gaps that hurt screen-reader users. This change fixes the test infrastructure and completes WCAG 2.2 AA coverage.

## Scope

### In Scope
- Fix 2 failing tests in `input.directive.spec.ts` (P0)
- Add `aria-describedby` wiring: input references error message IDs (P2)
- Add `for` attribute to `LabelDirective`, coordinated with input ID (P2)
- Add `role="group"` host binding to `FormField` (P3)
- Add Storybook stories: error state, validation-interaction, floating label (P3)

### Out of Scope
- `message/` directory (separate feature)
- `FormFieldTypes` enum cleanup
- Floating label CSS implementation

## Capabilities

### New Capabilities
- `forms-a11y`: Screen-reader support — `aria-describedby` linking inputs to errors, label `for`, form-field `role="group"`, validation-interaction state announcement.

### Modified Capabilities
None — no existing specs in `openspec/specs/`.

## Approach

**Phase 1 — Test fix (P0)**: Remove `TestBed.overrideProvider(NgControl, { useValue: null })` and `TestBed.overrideProvider(ElementRef, ...)` from `createWithControl()`. Let Angular DI resolve the real `NgControl` from the `[formControl]` binding. Replace the manually-created `nativeElement` with `dirEl.nativeElement` from the debug query. The `queueMicrotask` in `onBlur()` already has proper Promise-chain handling in tests.

**Phase 2 — ARIA wiring (P2)**: `FormField` generates a unique ID (counter). `InputDirective` reads it via DI and sets `[attr.aria-describedby]="id + '-error'"`. `LabelDirective` sets `[attr.for]` referencing the input ID. Error projection slot uses predictable IDs so consumers can set matching `id` attributes.

**Phase 3 — Stories (P3)**: Add `ErrorState`, `ValidationInteractionTouched`, and `FloatingLabel` stories using the existing `FormFieldRequiredTemplate` pattern with `Validators.required`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `forms/input/input.directive.spec.ts` | Modified | Remove NgControl/ElementRef overrides; fix 2 tests |
| `forms/input/input.directive.ts` | Modified | Add `aria-describedby` host binding |
| `forms/form-field/form-field.ts` | Modified | Add `role="group"`, unique ID signal |
| `forms/label/label.directive.ts` | Modified | Add `for` host binding |
| `forms/input/input.directive.stories.ts` | Modified | Add 3 new stories |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Removing NgControl override surfaces other issues | Low | No other test uses this pattern |
| ID collision in multi-instance scenarios | Low | Incrementing counter, single-page scoped |

## Rollback Plan

Revert the commit. Each phase is independently committable — revert ARIA/story commits without losing the test fix.

## Dependencies

None.

## Success Criteria

- [ ] `npm run test -- --testPathPatterns=input.directive.spec` passes all 4 tests
- [ ] `InputDirective` renders `aria-invalid`, `aria-required`, and `aria-describedby`
- [ ] `FormField` host has `role="group"`
- [ ] `LabelDirective` renders `for` attribute for the associated input
- [ ] Storybook stories for error state and validation-interaction render without errors
- [ ] `npm run test` full suite passes (no regressions)
