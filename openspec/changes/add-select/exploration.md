## Exploration: Select Component for bursit-angular

### Current State

**Architecture**: The library is an Angular 21.2 library using ng-packagr, with a mix of directive-based and component-based patterns. All classes are `standalone: true`. State is managed via Angular signals (`signal()`, `input()`, `model()`, `computed()`). Components use `ChangeDetectionStrategy.OnPush`.

**Form Integration**: The existing `InputDirective` extends `FormFieldControl<T>` and injects `NgControl` via `@Self() @Optional()`. It does NOT implement `ControlValueAccessor` itself — it relies on Angular's built-in `DefaultValueAccessor` for the native `<input>` element and reads validation/touched/disabled state from NgControl. The `FormField` component finds its control via `contentChild(FormFieldControl)` and wires up ARIA attributes (`aria-describedby`) and form-field state classes.

**CDK Overlay**: The `ModalService.open()` method creates an overlay using `this._overlay.create({...})` with `positionStrategy`, `scrollStrategy`, and `hasBackdrop`. It uses `ComponentPortal` to attach content. The Select will need a _connected_ position strategy (`FlexibleConnectedPositionStrategy`) rather than the global centered one used by Modal.

**Available CDK modules**: `@angular/cdk/a11y`, `@angular/cdk/overlay`, `@angular/cdk/listbox`, `@angular/cdk/text-field`, `@angular/cdk/bidi`. Notably, `@angular/cdk/combobox` is NOT available in CDK 21.2. `@angular/aria` is NOT installed.

**Design Tokens**: The `bursit-ui-tokens` package already has a full set of select-related tokens:

| Token | Purpose |
|-------|---------|
| `--select-bg`, `--select-color` | Trigger background/text |
| `--select-border-color`, `--select-border-radius`, `--select-border-width` | Trigger border |
| `--select-padding-x`, `--select-padding-y`, `--select-padding-end` | Trigger padding |
| `--select-font-size`, `--select-font-weight`, `--select-line-height` | Trigger typography |
| `--select-focus-border-color`, `--select-focus-shadow` | Trigger focus state |
| `--select-icon-color`, `--select-icon-size`, `--select-icon-offset` | Chevron icon |
| `--select-disabled-bg`, `--select-disabled-color`, `--select-disabled-border-color`, `--select-disabled-opacity` | Disabled state |
| `--select-option-bg`, `--select-option-color` | Option background/text |
| `--select-option-hover-bg`, `--select-option-hover-color` | Option hover state |
| `--select-option-focus-bg`, `--select-option-focus-color` | Option focus state |
| `--select-transition` | Transitions |
| `--z-index-dropdown` | Overlay stacking |
| `--shadow-lg`, `--shadow-md` | Dropdown shadows |
| `--color-focus-ring` | Focus ring color |

**Testing**: Jest via `@angular-builders/jest`, `jest-preset-angular`, `jsdom` environment. Tests use `TestBed.configureTestingModule` with `imports: [ComponentUnderTest]`. Signal inputs are set via `fixture.componentRef.setInput('name', value)`. CSS class assertions use `nativeElement.classList.contains(...)`. Both `it()` and `test()` conventions are used. No `describe(...)` nesting deep beyond 2 levels.

**Library Exports**: Barrel files in each component directory (`index.ts`) re-export the class. The top-level `lib/index.ts` re-exports all domains. `public-api.ts` re-exports `lib/index.ts`.

**SCSS Patterns**: Styles are in `styles/` directory (`_input.scss`, `_button.scss`, `_modal.scss`, etc.) using CSS custom properties exclusively. Component-level styles go in the component directory (`modal.component.scss`). Global SCSS is imported via `_index.scss` `@forward` pattern.

### Affected Areas

- `projects/bursit-angular/src/lib/select/` — NEW directory: `select.component.ts`, `select.component.scss`, `select.component.spec.ts`, `option.component.ts`, `select.stories.ts`, `index.ts`
- `projects/bursit-angular/src/lib/forms/form-field/form-field-control.directive.ts` — MODIFIED: add Select to the `FormFieldControl` contract (or extend it)
- `projects/bursit-angular/src/lib/forms/form-field/form-field-types.enum.ts` — MODIFIED: add `SELECT` type
- `projects/bursit-angular/src/lib/forms/form-field/index.ts` — may need re-export update
- `projects/bursit-angular/src/lib/forms/input/input.directive.ts` — MODIFIED: may extract shared form-control logic into a base class or mixin
- `projects/bursit-angular/src/lib/index.ts` — MODIFIED: add `export * from './select'`
- `projects/bursit-angular/src/styles/_select.scss` — NEW: global select styles using design tokens
- `projects/bursit-angular/src/styles/_index.scss` — MODIFIED: add `@forward 'select'`
- `bursit-ui-tokens/index.css` — NO CHANGE (tokens already exist)

### Approaches

#### Approach A: Native `<select>` styled as custom (hidden native + custom overlay)

Use a hidden native `<select>` for accessibility and form integration, with a custom visual overlay for styling.

- **Pros**:
  - Free mobile/desktop keyboard-native select experience
  - Native form integration (no ControlValueAccessor needed, or minimal)
  - `<option>` elements automatically provide optgroup support
  - Free form validation, required, disabled handling
- **Cons**:
  - Extremely limited styling (dropdown options cannot be styled cross-browser)
  - No search/filter capability
  - No multi-select
  - Native select popup on mobile prevents consistent UX
  - Option content limited to text (no icons, avatars, rich content in options)
  - The custom overlay is purely decorative — ARIA would be confusing (two representations of the same list)
- **Effort**: Low

#### Approach B: CDK Listbox + Overlay (headless) ← RECOMMENDED

Use `@angular/cdk/listbox` for keyboard navigation and ARIA + `@angular/cdk/overlay` for dropdown positioning. The CDK Listbox directive handles `role=listbox/option`, `aria-selected`, roving tabindex, arrow-key navigation, typeahead, and multi-select keyboard patterns.

- **Pros**:
  - Full style control over trigger AND options (icons, avatars, rich content)
  - CDK Listbox provides keyboard nav: arrow keys, Home/End, typeahead search
  - CDK Listbox provides ARIA wiring: role, aria-selected, aria-activedescendant or roving tabindex
  - CDK Overlay provides flexible positioning, scroll strategies, backdrop click handling
  - Reuses patterns already established in Modal (Overlay creation, injection tokens)
  - Design tokens already exist for all visual states
  - Can wrap in `FormFieldControl` to fit existing `bursit-form-field` pattern
  - Search/filter can be added in v2 by composing with an input
  - Single-select by default; multi-select possible via `[multi]="true"` on CDK Listbox
- **Cons**:
  - Must implement `ControlValueAccessor` manually (or extend form integration patterns from InputDirective)
  - Requires careful ARIA verification (combobox role, aria-expanded on trigger, aria-controls linking)
  - No built-in combobox pattern — CDK has listbox but NOT combobox. Must role-wire manually:
    - The trigger needs `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-haspopup="listbox"`
    - The popup listbox needs `role="listbox"`, `aria-labelledby` pointing back to trigger
  - CDK Listbox doesn't handle the combobox's input/filter pattern out of the box — but for a read-only Select, this isn't needed
- **Effort**: Medium

#### Approach C: CDK Overlay + manual keyboard nav and ARIA (like Modal)

Build from scratch with CDK Overlay for positioning, manual keyboard event handling, and manual ARIA attribute management.

- **Pros**:
  - Maximum control over every behavior
  - No dependency on CDK listbox patterns that may not perfectly match combobox spec
- **Cons**:
  - Reinventing keyboard navigation (roving tabindex, typeahead, Home/End, arrow keys)
  - Reinventing ARIA role+state wiring (aria-selected, activedescendant management)
  - Harder to get right — edge cases like dynamic options, filtered lists, focus restoration
  - More code to test and maintain
  - Duplicates effort that CDK listbox already solves
- **Effort**: High

### Recommendation

**Approach B: CDK Listbox + Overlay** for v1, with the following scope:

**v1 Scope (single-select only)**:
- **Component**: `<bursit-select>` with `[options]` input (array of `{value, label, disabled?}`) and optionally `<bursit-option>` for content projection with rich content
- **Form Integration**: Implement `ControlValueAccessor` so it works with both template-driven (`[(ngModel)]`) and reactive forms (`[formControl]`)
- **FormField Integration**: Implement `FormFieldControl` abstract class so it works inside `<bursit-form-field>` with labels, errors, and messages
- **Dropdown Overlay**: Use CDK Overlay with `FlexibleConnectedPositionStrategy`, reponsive repositioning, scroll strategy
- **Keyboard Navigation**: Delegate to CDK Listbox (`ngListbox` + `ngOption`) for items in dropdown
- **Accessibility**: Trigger has `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-haspopup="listbox"`. Dropdown has `role="listbox"` with `aria-labelledby` pointing back to trigger. Selected option has `aria-selected="true"`.
- **Visual States**: Focus ring, hover, disabled, error (from FormField), placeholder text, empty state
- **Testing**: Jest unit tests (creation, form integration, value selection, keyboard, ARIA). Storybook stories.
- **No search/filter** — defer to v2
- **No multi-select** — defer to v2
- **No virtual scrolling** — defer to v2
- **No optgroup** — defer to v2

**Why Approach B over A**: The native `<select>` approach would limit the library's design system ambitions. Bursit is building a full-featured, consistent design system. A Select that can't show icons in options, can't be consistently styled, and can't evolve into multi-select/search/filter is a dead end.

**Why Approach B over C**: CDK Listbox handles 90% of the accessibility complexity. Manual implementation would duplicate battle-tested CDK code and introduce subtle keyboard/ARIA bugs.

### Risks

1. **CDK Listbox is NOT a Combobox**: The CDK provides `listbox` but NOT `combobox`. For a read-only Select (no typing to filter), this is fine — the listbox handles the option list while we manually wire the combobox role on the trigger. However, if v2 adds search/filter, we'd need to implement combobox-input patterns manually (the `@angular/cdk/combobox` module doesn't exist in CDK 21.2).

2. **ARIA Complexity**: The combobox+listbox ARIA pattern is more complex than the dialog pattern used in Modal. Must correctly wire: `aria-expanded`, `aria-controls` (trigger→listbox), `aria-labelledby` (listbox→trigger or label), `aria-activedescendant` vs roving tabindex, and `aria-selected` on the active option. The CDK Listbox likely uses roving tabindex (not activedescendant) — verify this.

3. **Form Integration Edge Cases**: `ControlValueAccessor` implementation must handle: programmatic value changes, `writeValue(null)` for reset, disabled state propagation, `registerOnTouched` for validation interaction patterns, and compatibility with Angular's built-in validators. The existing InputDirective pattern (injecting NgControl, not implementing CVA) may not directly translate — the Select needs to be the value source.

4. **Position Strategy**: `FlexibleConnectedPositionStrategy` requires a connection element (the trigger). Need to ensure the trigger element reference is available when the overlay opens. Also need to handle repositioning on scroll/resize and dynamic content changes.

5. **Overlay Cleanup**: Must properly dispose overlay refs when the component destroys, and handle the case where the trigger element is removed from the DOM while the overlay is open.

6. **CDK Version Compatibility**: CDK 21.2 listbox API may differ from documentation for older versions. Must read the actual type definitions at `node_modules/@angular/cdk/types/listbox.d.ts` during implementation to verify the directive selectors and input/output APIs.

### Ready for Proposal
Yes — the exploration provides sufficient clarity on the approach and scope. The orchestrator should launch `sdd-propose` next.
