# Tasks: Add Select Component

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~810 |
| 400-line budget risk | **High** |
| Chained PRs recommended | **Yes** |
| Suggested split | PR 1 (195) → PR 2 (290) → PR 3 (325) |
| Delivery strategy | ask-always |
| Chain strategy | stacked-to-main (resolved: stacked chained PRs) |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | PR | Notes |
|------|------|----|-------|
| 1 | Foundation + Component skeleton + SCSS | PR 1 | Standalone: trigger renders with placeholder, focused/hovered/disabled signals. No overlay, CVA, or options. |
| 2 | Overlay, dropdown, options, keyboard | PR 2 | CDK overlay + listbox: open/close lifecycle, ArrowUp/Down/Home/End/Enter, option component. |
| 3 | CVA, ARIA, FormField, edge cases, stories | PR 3 | Full forms integration, combobox/listbox ARIA, `prefers-reduced-motion`, edge case coverage, Storybook. |

---

## Phase 1: Foundation (PR 1)

- [x] 1.1 Add `SELECT = 'select'` to `FormFieldTypes` in `lib/forms/form-field/form-field-types.enum.ts`
- [x] 1.2 Create select styles consuming `--select-*` token variables for trigger, chevron, panel, option, and state tokens (component-scoped `select.scss` + `option.scss`)
- [x] 1.3 Export select styles through the library build
- [x] 1.4 Create `lib/forms/select/index.ts` barrel; add export to `lib/forms/index.ts`

## Phase 2: Select Component Core (PR 1)

- [x] 2.1 [RED] `select.spec.ts`: creation, placeholder, disabled, focused/hovered signal toggles
- [x] 2.2 [GREEN] `select.ts`: standalone, `placeholder`/`disabled`/`required`/`floatingLabel` inputs; `focused`/`hovered`/`hasValue`/`invalid` signals; wire `FormFieldControl` provider with `forwardRef`; inject `NgControl` @Self @Optional
- [x] 2.3 [GREEN] `select.html`: trigger with `.bursit-select-trigger`, placeholder text fallback, chevron via `<bursit-icon>`
- [x] 2.4 [GREEN] `select.scss`: trigger border, padding, chevron, disabled/error state tokens
- [x] 2.5 [REFACTOR] Verify tests green after template + styles wired

## Phase 3: Dropdown & Overlay (PR 2)

- [x] 3.1 [RED] `select.spec.ts`: open on click/Enter/Space/ArrowDown/ArrowUp while closed (arrow keys open — maintainer decision 2026-08-24, reversing the earlier "not ArrowDown" wording), close on Escape/outside click/selection, focus returns to trigger
- [x] 3.2 [GREEN] `select.ts`: declarative overlay driven by `isOpen()` signal; `toggle()` guards disabled + focuses trigger on open; `close()` no-op guard; `onOverlayDetach()` resets open state + fires touched
- [x] 3.3 [GREEN] `select.html`: `<ng-template cdk-connected-overlay>` hosting `.bursit-select-panel` (`role="listbox"`, deterministic id); transparent backdrop closes via detach/backdropClick
- [x] 3.4 [GREEN] overlay `matchWidth`; chevron rotates on open (`[aria-expanded='true'] bursit-icon`)

## Phase 4: Options & Keyboard (PR 2)

- [x] 4.1 Create `option.ts`: standalone, `value`/`disabled` inputs; registers via injected `BURSIT_SELECT` token; deterministic DOM id; `<ng-content>` for icon/label
- [x] 4.2 [RED] `select.spec.ts`: ArrowUp/Down/Home/End navigation, Enter/Space select, no wrap past last option, skip disabled options
- [x] 4.3 [GREEN] `select.ts`: options registry via `registerOption`/`unregisterOption`; `activeOption` signal drives activedescendant + `.bursit-option-active`; Arrow/Home/End navigate enabled options without wrapping; Enter/Space select the active option; Escape closes + refocuses trigger
- [x] 4.4 [GREEN] `select.html` + option host bindings: projected `<bursit-option>`; trigger `aria-haspopup="listbox"`, `aria-controls` → panel id when open, `aria-activedescendant` mirrors active option id

## Phase 5: CVA & Forms (PR 3)

- [ ] 5.1 [RED] `select.component.spec.ts`: `writeValue` updates trigger; `registerOnChange` fires on select; `registerOnTouched` fires on close; `setDisabledState` blocks open
- [ ] 5.2 [GREEN] `select.component.ts`: `ControlValueAccessor` — `writeValue(v)` sets `_value`, calls `cdkListbox.selectValue(v)` if open; `registerOnChange`/`registerOnTouched` store callbacks; `_onChange` fires on `cdkListbox.valueChange` + close; `setDisabledState` sets `disabled` model signal

## Phase 6: ARIA & Accessibility (PR 3)

- [x] 6.1 [RED] `select.spec.ts`: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-haspopup="listbox"`, `aria-activedescendant` mirror; listbox/option roles + `aria-selected`
- [x] 6.2 [GREEN] `select.ts`/`select.html`: static combobox attrs; dynamic `aria-expanded`/`aria-controls`/`aria-activedescendant` via template bindings from signals/computed state; deterministic panel + option ids
- [ ] 6.3 [GREEN] `select.scss`: `@media (prefers-reduced-motion: reduce)` → instant transitions

## Phase 7: FormField Integration (PR 3)

- [ ] 7.1 [RED] `select.component.spec.ts`: nest in `<bursit-form-field>`; verify `.bursit-form-field-error` on invalid, `.bursit-form-field-floating-label` on value, `.bursit-focus` on focus
- [ ] 7.2 [GREEN] `select.component.ts`: inject `FORM_FIELD_ID`; wire trigger `id` + `aria-describedby`; `type = FormFieldTypes.SELECT`

## Phase 8: Edge Cases & Polish (PR 3)

- [ ] 8.1 [RED] `select.component.spec.ts`: empty options, single option, long text truncation, rapid open/close, destroy-while-open, `writeValue` while open
- [ ] 8.2 [GREEN] `select.component.stories.ts`: default, with form-field, disabled, required/error, long text, zero options, one option, keyboard nav demo
- [ ] 8.3 [GREEN] Run `npm run build` to confirm zero errors
