# Proposal: Add Select Component

**Change**: `add-select`
**Status**: Proposed
**Created**: 2026-07-24

---

## Intent

Add a `bursit-select` component to the bursit-angular library. This is a Tier 2 component that provides a single-select dropdown with full keyboard navigation, ARIA accessibility, form integration via `ControlValueAccessor`, and seamless integration with the existing `bursit-form-field` pattern.

The Select component fills a gap in the library's form controls — currently only `InputDirective` (text input and textarea) and `PinEntry` exist. Adding Select unlocks dropdown selection patterns for consumers of the design system.

---

## Scope

### In Scope (v1)

- `<bursit-select>` standalone component
- Single-select only (one value at a time)
- Trigger element with: click, Enter, Space to open dropdown (NOT arrow-down)
- Dropdown overlay using `@angular/cdk/overlay` with `FlexibleConnectedPositionStrategy`
- Option list using `@angular/cdk/listbox` (`ngListbox` + `ngOption` directives) for keyboard navigation and ARIA wiring within the dropdown
- Placeholder text with floating label when inside `<bursit-form-field>`
- Options support an optional icon via the existing `<bursit-icon>` component
- Dropdown width matches trigger width (`min-width: 100%`)
- Closes automatically on option selection
- Full keyboard navigation: arrow keys, Enter, Escape, Home, End
- Full ARIA: `role="combobox"` on trigger, `role="listbox"` on dropdown, `role="option"` on items, `aria-expanded`, `aria-controls`, `aria-labelledby`, `aria-haspopup="listbox"`, `aria-selected`
- Form integration: implements `ControlValueAccessor` for template-driven (`[(ngModel)]`) and reactive forms (`[formControl]`)
- Implements `FormFieldControl` abstract class to integrate with existing `<bursit-form-field>`
- Styling via design tokens from `bursit-ui-tokens` (tokens already exist — see `--select-*` variables)
- Storybook stories covering all visual states
- Jest unit tests (component creation, value selection, form integration, keyboard navigation, ARIA attributes)
- Barrel export + public API registration

### Out of Scope (v1 — explicitly deferred)

| Feature | Reason | Target |
|---------|--------|--------|
| Search/filter within dropdown | No CDK combobox available; requires manual input+filter pattern | v2 |
| Multi-select (`[multiple]`) | CDK Listbox supports it, but adds complexity to CVA value shape, chip display, and keyboard patterns | v2 |
| Virtual scrolling for large option lists | Requires `@angular/cdk/scrolling` or custom implementation; premature optimization for v1 | v2 |
| Option groups (`<optgroup>`) | Not supported by CDK Listbox natively; requires custom group rendering | v2 |
| Arrow-down on trigger to open dropdown | Deliberate product decision — trigger arrow keys navigate the listbox when open, not to open it | v2 (reconsider) |

---

## Approach

### Architecture Decision: CDK Listbox + Overlay

**Chosen approach**: Use `@angular/cdk/listbox` for keyboard navigation and ARIA roles within the dropdown, and `@angular/cdk/overlay` for dropdown positioning and backdrop behavior.

**Why not native `<select>`?** Extremely limited cross-browser styling of options. Cannot show icons, rich content, or consistently styled states. Native mobile popover conflicts with the design system's visual consistency goals. Dead-end for future features (search, multi-select).

**Why not manual keyboard/ARIA from scratch?** The CDK Listbox already handles 90% of the complexity: arrow-key navigation, Home/End, roving tabindex, `aria-selected` management, and typeahead. Building from scratch duplicates battle-tested CDK code and introduces subtle accessibility bugs.

**CDK Combobox caveat**: `@angular/cdk/combobox` does NOT exist in CDK 21.2. Since v1 Select is read-only (no typing to filter), the CDK Listbox handles the option list while we manually wire `role="combobox"` and related ARIA attributes on the trigger element. If v2 adds search/filter, we will need to implement the combobox input pattern manually or wait for CDK combobox to land.

### Component Structure

```
lib/select/
├── select.component.ts          # Main Select CVA component
├── select.component.scss        # Component-host styles
├── select.component.spec.ts     # Unit tests
├── select.stories.ts            # Storybook stories
├── option.component.ts          # Option component (content projection)
└── index.ts                     # Barrel export
```

#### `select.component.ts`

- **Template**: Trigger element (`role="combobox"`) + CDK Overlay portal containing listbox (`ngListbox`) with projected `<bursit-option>` children
- **Host**: `standalone: true`, `ChangeDetectionStrategy.OnPush`, `providers: [{ provide: NG_VALUE_ACCESSOR, useExisting, multi: true }]`
- **Implements**: `ControlValueAccessor`, `FormFieldControl`, `AfterViewInit`, `OnDestroy`
- **Key properties**:
  - `Signal<boolean>` for `open`, `focused`, `hovered`, `disabled`, `invalid`
  - `InputSignal<string>` for `placeholder`, `floatingLabel`
  - `InputSignal<boolean>` for `disabled`, `required`
  - `OverlayRef` for dropdown overlay (created on open, disposed on destroy)
  - `TemplateRef` or `CdkListbox` reference for the panel content
  - `@ContentChildren(bursitOption)` for tracking option children
- **Key methods**:
  - `open()` / `close()` / `toggle()` — manage overlay lifecycle
  - `writeValue()`, `registerOnChange()`, `registerOnTouched()`, `setDisabledState()` — CVA
  - `_onKeydown(event)` — handle trigger keydown (Enter, Space, Escape)
- **Signal-based state**: Use `signal()`, `computed()` for internal reactive state (following existing library patterns)

#### `option.component.ts`

- **Template**: `<ng-content>` for projected content, optional `<bursit-icon>` rendering
- **Host**: `standalone: true`, `ngOption` directive from CDK Listbox
- **Inputs**:
  - `InputSignal<string>` for `value` (the selected value)
  - `InputSignal<boolean>` for `disabled`
  - `InputSignal<string>` for `icon` (optional)
- **No CVA** — the parent Select manages the value; Option just renders content and registers with the CDK Listbox

### FormField Integration

The Select extends `FormFieldControl<T>` (same abstract class used by `InputDirective`):

```typescript
export class SelectComponent implements ControlValueAccessor, FormFieldControl<any> {
  readonly type = FormFieldTypes.SELECT; // NEW enum value
  readonly focused = signal(false);
  readonly hovered = signal(false);
  readonly invalid = computed(() => ...);
  readonly hasValue = computed(() => ...);
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  floatingLabel = input<boolean>(false);
  // ...
}
```

The existing `FormField` component discovers its control via `contentChild(FormFieldControl)` — no changes needed to the FormField itself. We add `SELECT = 'select'` to the `FormFieldTypes` enum.

### Overlay Strategy

- Uses `FlexibleConnectedPositionStrategy` with the trigger element as origin (`originX: 'start', originY: 'bottom'`, `overlayX: 'start', overlayY: 'top'`)
- `scrollStrategy: block()` — blocks background scroll while open
- `hasBackdrop: true` — click outside closes dropdown
- `width` of overlay panel = trigger width via `min-width: 100%` CSS (alternative: `width` input on position strategy)
- Reposition on window resize and scroll

**Reference**: The existing `ModalService.open()` in `projects/bursit-angular/src/lib/modal/` already uses CDK Overlay — we follow the same patterns (overlay creation, portal attachment, disposal on destroy).

### Styling

- **Global SCSS**: `styles/_select.scss` using `--select-*` design tokens from `bursit-ui-tokens`
- **Component SCSS**: `select.component.scss` for host-level layout only
- **Tokens already exist**: All `--select-*` tokens are defined in `bursit-ui-tokens/index.css` — no token package changes needed

### Testing Strategy

- **Unit tests** (Jest): Component creation, value selection via click and keyboard, form integration (reactive + template-driven), ARIA attribute assertions, disabled/readonly states, overlay open/close lifecycle, CVA writeValue/registerOnChange flows
- **Storybook stories**: Default, with placeholder, disabled, required, with icons, with FormField + label, error state, empty state, keyboard interaction demo

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **CDK Listbox not a Combobox** — manual `role="combobox"` wiring may conflict with CDK's roving tabindex pattern | Medium | Verify CDK Listbox ARIA behavior first. If it uses roving tabindex, we manage `aria-activedescendant` manually on the trigger, keeping CDK's role wiring only on the listbox/list items |
| **ARIA complexity** — `aria-controls`, `aria-labelledby`, and `aria-activedescendant` cross-referencing between trigger and listbox is error-prone | Medium | Write dedicated ARIA assertion tests. Cross-reference WAI-ARIA combobox pattern (1.3) during implementation |
| **CVA edge cases** — `writeValue(null)`, programmatic value changes, disabled state propagation | Low | Pattern follows well-documented Angular CVA contract. Test coverage for these edge cases |
| **Overlay lifecycle leaks** — overlay ref not disposed on destroy, trigger removed while overlay open | Low | Follow ModalService disposal pattern. Add `ngOnDestroy` cleanup. Test with fixture.destroy() |
| **FormFieldControl contract mismatch** — existing `FormFieldControl` is designed for directives, not components | Low | Select implements the same abstract class. The FormField uses `contentChild(FormFieldControl)` — works with both directives and components |
| **CDK Listbox API changes** — CDK 21.2 listbox directive selectors/APIs may differ from documentation | Low | Read actual type definitions at `node_modules/@angular/cdk/types/listbox.d.ts` before implementation |

---

## Rollback Plan

If the Select component cannot be completed within scope or introduces blocking issues:

1. Remove the `select/` directory and its barrel export entry from `lib/index.ts`
2. Revert the `FormFieldTypes.SELECT` enum addition (or leave it — harmless dead code)
3. Remove `@forward 'select'` from `styles/_index.scss`
4. No other library components depend on Select — rollback is isolated and non-disruptive

---

## References

- [WAI-ARIA Combobox Pattern (1.3)](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [WAI-ARIA Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- [Angular CDK Listbox](https://material.angular.io/cdk/listbox/overview)
- [Angular CDK Overlay](https://material.angular.io/cdk/overlay/overview)
- [Angular ControlValueAccessor](https://angular.dev/api/forms/ControlValueAccessor)
- Exploration artifact: `openspec/changes/add-select/exploration.md`
- Design tokens: `bursit-ui-tokens/index.css` (`--select-*` variables)
- Existing FormField pattern: `projects/bursit-angular/src/lib/forms/form-field/`
- Existing Overlay pattern: `projects/bursit-angular/src/lib/modal/modal.service.ts`
