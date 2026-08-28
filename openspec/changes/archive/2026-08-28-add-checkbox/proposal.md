# Proposal: Checkbox Component

## Intent

The library has text inputs, textarea, and select — but no checkbox (#7). Forms that need consent, boolean toggles, or multi-select lists currently fall back to unstyled native inputs, breaking visual consistency and losing the error/disabled/required semantics the rest of the form family already provides.

## Scope

### In Scope
- `CheckboxComponent` (`bursit-checkbox`): standalone by default, native `<input type="checkbox">` under the hood.
- Projected label content (ng-content), rendered beside the box; clicking the label toggles via label-input association.
- Indeterminate state in v1 (tokens already exist in bursit-ui-tokens).
- Full `ControlValueAccessor` (works with `[formControl]`, `ngModel`) — same pattern as Select.
- `FormFieldControl` implementation so it works inside `bursit-form-field`: `invalid`, `disabled`, `required` + `aria-describedby` wiring to error/message slots.
- Library SCSS entry `_checkbox.scss` consuming existing `--checkbox-*` tokens.
- Jest spec + Storybook stories mirroring input/select story structure.

### Out of Scope
- `bursit-checkbox-group` container (follow-up issue).
- Radio group (#9) even though patterns overlap.
- New design tokens — all required `--checkbox-*` tokens already ship in bursit-ui-tokens.

## Capabilities

> Contract with the specs phase.

### New Capabilities
- `checkbox`: selection state (checked/unchecked/indeterminate), keyboard interaction, forms integration (CVA), FormField integration (error/disabled/required/describedby), projected label association.

### Modified Capabilities
- None.

## Approach

Follow the established form-family pattern: component provides itself as both `ControlValueAccessor` and `FormFieldControl` (via forwardRef). Signals for checked/indeterminate/focused/hovered/invalid/disabled/required. Wire `id` + `aria-describedby = ${fieldId}-error ${fieldId}-message` from injected `FORM_FIELD_ID` when not user-set. No floating-label or placeholder logic — those parts of the contract stay unimplemented (all members optional). Reuse `queueMicrotask` blur-invalid pattern only if touched-based validation is needed.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/forms/checkbox/` | New | Component + template + styles + spec + stories |
| `src/lib/forms/index.ts` | Modified | Export checkbox barrel |
| `src/styles/_checkbox.scss` | New | Token-consuming styles entry |
| `src/styles/_index.scss` | Modified | Forward `_checkbox.scss` |
| `public-api.ts` / `lib/index.ts` | None | Already re-exported via forms barrel |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CVA + indeterminate interplay (indeterminate is DOM-only, not part of form value) | Medium | Spec explicitly defines indeterminate as view-state, never written to FormControl value |
| Label click double-toggling (label wraps input) | Low | Use explicit `for`/`id` association instead of wrapping |
| FormField layout assumptions built for floating labels | Medium | Verify standalone + inside-form-field stories early |

## Rollback Plan

All changes are additive new files plus two one-line edits (`forms/index.ts`, `_index.scss`). Reverting the single feature branch removes the component entirely; no existing behavior is modified.

## Dependencies

- `bursit-ui-tokens` (file: dependency) must keep exporting `checkbox.scss` token definitions.

## Success Criteria

- [ ] `bursit-checkbox` works standalone and inside `bursit-form-field` with error/message slots wired via aria-describedby.
- [ ] `[formControl]` binding reflects checked state bidirectionally.
- [ ] Indeterminate renders correctly without altering the FormControl value.
- [ ] `npm run test` passes with checkbox coverage ≥ 80%.
- [ ] Stories cover Default, Disabled, Required, ErrorState, Indeterminate, InsideFormField, Playground.
