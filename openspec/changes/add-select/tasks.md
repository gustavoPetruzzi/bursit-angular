# Tasks: Add Select Component

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~810 |
| 400-line budget risk | **High** |
| Chained PRs recommended | **Yes** |
| Suggested split | PR 1 (195) → PR 2 (290) → PR 3 (325) |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | PR | Notes |
|------|------|----|-------|
| 1 | Foundation + Component skeleton + SCSS | PR 1 | Standalone: trigger renders with placeholder, focused/hovered/disabled signals. No overlay, CVA, or options. |
| 2 | Overlay, dropdown, options, keyboard | PR 2 | CDK overlay + listbox: open/close lifecycle, ArrowUp/Down/Home/End/Enter, option component. |
| 3 | CVA, ARIA, FormField, edge cases, stories | PR 3 | Full forms integration, combobox/listbox ARIA, `prefers-reduced-motion`, edge case coverage, Storybook. |

---

## Phase 1: Foundation (PR 1)

- [ ] 1.1 Add `SELECT = 'select'` to `FormFieldTypes` in `lib/forms/form-field/form-field-types.enum.ts`
- [ ] 1.2 Create `styles/_select.scss` with `--select-*` token variables for trigger, chevron, panel, option, and state tokens
- [ ] 1.3 Add `@forward 'select'` to `styles/_index.scss`
- [ ] 1.4 Create `lib/forms/select/index.ts` barrel; add `export * from './select'` to `lib/forms/index.ts`

## Phase 2: Select Component Core (PR 1)

- [ ] 2.1 [RED] `select.component.spec.ts`: creation, placeholder, disabled, focused/hovered signal toggles
- [ ] 2.2 [GREEN] `select.component.ts`: standalone, `placeholder`/`disabled`/`required`/`floatingLabel` inputs; `focused`/`hovered`/`hasValue`/`invalid` signals; wire `FormFieldControl` provider with `forwardRef`; inject `NgControl` @Self @Optional
- [ ] 2.3 [GREEN] `select.component.html`: trigger with `.bursit-select-trigger`, placeholder text fallback, chevron via `<bursit-icon name="chevron-down">`
- [ ] 2.4 [GREEN] `select.component.scss`: trigger border, padding, chevron, disabled/error state tokens
- [ ] 2.5 [REFACTOR] Verify tests green after template + styles wired

## Phase 3: Dropdown & Overlay (PR 2)

- [ ] 3.1 [RED] `select.component.spec.ts`: open on click/Enter/Space (not ArrowDown), close on Escape/outside click/selection, focus returns to trigger
- [ ] 3.2 [GREEN] `select.component.ts`: inject `Overlay`; `FlexibleConnectedPositionStrategy` (bottom-start → top-start); `scrollStrategy.block()`; `hasBackdrop: true`; `_overlayRef` reuse across cycles; dispose on `ngOnDestroy`
- [ ] 3.3 [GREEN] `select.component.html`: `<ng-template #panel>` Portal with `.bursit-select-panel` class
- [ ] 3.4 [GREEN] `select.component.scss`: panel `min-width: 100%`, chevron rotation on open state

## Phase 4: Options & Keyboard (PR 2)

- [ ] 4.1 Create `option.component.ts`: standalone, `value`/`disabled` inputs; `[cdkOption]="value()"`, `[cdkOptionDisabled]`; `<ng-content>` for icon/label
- [ ] 4.2 [RED] `select.component.spec.ts`: ArrowUp/Down/Home/End navigation, Enter selects, no wrap past last option
- [ ] 4.3 [GREEN] `select.component.ts`: `@ViewChild(CdkListbox)`; subscribe `valueChange` → store value; `writeValue` → `cdkListbox.selectValue()`; `@ContentChildren` options projected to listbox
- [ ] 4.4 [GREEN] `select.component.html`: `[cdkListbox] useActiveDescendant=true`; `<ng-content select="bursit-option">`; attach `#panel` to overlay via `TemplatePortal`

## Phase 5: CVA & Forms (PR 3)

- [ ] 5.1 [RED] `select.component.spec.ts`: `writeValue` updates trigger; `registerOnChange` fires on select; `registerOnTouched` fires on close; `setDisabledState` blocks open
- [ ] 5.2 [GREEN] `select.component.ts`: `ControlValueAccessor` — `writeValue(v)` sets `_value`, calls `cdkListbox.selectValue(v)` if open; `registerOnChange`/`registerOnTouched` store callbacks; `_onChange` fires on `cdkListbox.valueChange` + close; `setDisabledState` sets `disabled` model signal

## Phase 6: ARIA & Accessibility (PR 3)

- [ ] 6.1 [RED] `select.component.spec.ts`: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-haspopup="listbox"`, `aria-activedescendant` mirror; listbox/option roles + `aria-selected`
- [ ] 6.2 [GREEN] `select.component.ts`: static combobox attrs; dynamic `aria-expanded`/`aria-controls` via host binding; `aria-activedescendant` mirror via `effect()` + `Renderer2` copying from listbox; `aria-labelledby` on panel
- [ ] 6.3 [GREEN] `select.component.scss`: `@media (prefers-reduced-motion: reduce)` → instant transitions

## Phase 7: FormField Integration (PR 3)

- [ ] 7.1 [RED] `select.component.spec.ts`: nest in `<bursit-form-field>`; verify `.bursit-form-field-error` on invalid, `.bursit-form-field-floating-label` on value, `.bursit-focus` on focus
- [ ] 7.2 [GREEN] `select.component.ts`: inject `FORM_FIELD_ID`; wire trigger `id` + `aria-describedby`; `type = FormFieldTypes.SELECT`

## Phase 8: Edge Cases & Polish (PR 3)

- [ ] 8.1 [RED] `select.component.spec.ts`: empty options, single option, long text truncation, rapid open/close, destroy-while-open, `writeValue` while open
- [ ] 8.2 [GREEN] `select.component.stories.ts`: default, with form-field, disabled, required/error, long text, zero options, one option, keyboard nav demo
- [ ] 8.3 [GREEN] Run `npm run build` to confirm zero errors
