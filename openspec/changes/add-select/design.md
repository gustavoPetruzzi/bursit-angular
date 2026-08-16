# Design: Select Component

## Architecture Overview

`SelectComponent` (standalone, CVA, FormFieldControl) owns a trigger (`role="combobox"`) and manages a CDK Overlay panel containing a CDK Listbox (`[cdkListbox] useActiveDescendant=true`). Options are `<bursit-option>` children projecting into `[cdkOption]` directives. Value flows: CDK `valueChange` → Select CVA `onChange` → form. `writeValue` → `CdkListbox.selectValue()`. Mirrors `InputDirective`'s signal patterns for FormFieldControl.

## Component Tree

```
<bursit-form-field>
  <bursit-select>              ← CVA + FormFieldControl
    <div trigger>              ← combobox, tabindex=0
    <ng-template #panel>       ← Overlay TemplatePortal
      <div [cdkListbox]>       ← CDK directive
        <bursit-option>        ← @ContentChildren, wraps [cdkOption]
```

**New**: `select.component.ts/scss/spec.ts/stories.ts`, `option.component.ts`, `index.ts`, `styles/_select.scss`.

**Modified**: `styles/_index.scss`, `lib/index.ts`, `form-field-types.enum.ts` (+`SELECT`).

## Architecture Decisions

| Decision | Choice | Tradeoff & Rationale |
|---|---|---|
| CVA owner | SelectComponent owns CVA; CDK Listbox used imperatively via `valueChange`/`selectValue()` | CDK's built-in CVA emits `T[]` (multi-select). Single-select contract is `T` |
| Overlay strategy | `FlexibleConnectedPositionStrategy`, `scrollStrategy.block()`, `hasBackdrop: true` | Matches Modal pattern. Backdrop click closes — native select UX |
| Panel width | CSS `min-width: 100%` on overlay pane | Simpler than ResizeObserver; sufficient for horizontal alignment |
| `useActiveDescendant` | `true` on CDK Listbox; mirror to trigger via `effect()` + `Renderer2.setAttribute()` | WAI-ARIA 1.3: trigger retains focus. CDK puts activedescendant on listbox — copy to combobox trigger |
| Option value type | `unknown` (no generic class param) | Matches `FormFieldControl<any>` + CDK default |
| Icon rendering | Content projection (`<ng-content>` in option) | Zero-cost. User controls `<bursit-icon>` size/color |

## Data Flow

```
Click/press trigger → open() → overlay.create + attach portal → aria-expanded=true
ArrowDown → CDK ActiveDescendantKeyManager → mirrored to trigger via effect
Enter/click option → CDK valueChange → _onChange(value) → close() → _onTouched()

Programmatic writeValue(val):
  _value.set(val), trigger updates label; if open: cdkListbox.selectValue(val)
```

## SelectComponent Class Design

**Signals**: `placeholder` (InputSignal), `disabled` (ModelSignal, two-way via CVA `setDisabledState`), `required`, `floatingLabel` (InputSignals). `focused`, `hovered` (writable Signals, HostListeners). `invalid` (computed from NgControl, filtered by `validationInteraction`). `hasValue` (computed from internal `_value`). `open` (writable, controls overlay + aria-expanded).

**Contract**: `type = FormFieldTypes.SELECT`, `control: NgControl` (injected `@Self() @Optional()`), implements `ControlValueAccessor` + `FormFieldControl<any>`.

**Internal**: `_cdkListbox: CdkListbox` (`@ViewChild`), used imperatively for `selectValue()` and subscribing `valueChange`. `_overlayRef: OverlayRef` — created on first open, reused, disposed on destroy. `_onChange`, `_onTouched` — CVA callbacks.

**DI**: `inject(Overlay)`, `inject(ElementRef)`, `inject(Renderer2)`, `@Self() @Optional() inject(NgControl)`, `inject(FORM_FIELD_ID, {optional: true})`.

## SelectOption Class Design

Standalone component. `value: InputSignal<unknown>` → `[cdkOption]="value()"`, `disabled: InputSignal<boolean>` → `[cdkOptionDisabled]`. Label resolved from `textContent` for trigger display. Template: `<ng-content>` on element with CDK directives.

## CVA Integration

`writeValue(val)` → `_value.set(val)`; if dropdown open: `cdkListbox.selectValue(val)`. `registerOnChange(fn)` / `registerOnTouched(fn)` → stored. `setDisabledState(d)` → `disabled.set(d)`. On `cdkListbox.valueChange`: `_onChange(event.value[0])`, close, `_onTouched()`. `_onTouched` fires on dropdown close — matches native select and spec.

## FormFieldControl Signals

Same contract as `InputDirective`: `focused`, `hovered` (host listeners), `invalid` (computed from NgControl), `hasValue` (computed from internal value). No `hasPlaceholder` — placeholder IS the default display text.

## Overlay Configuration

`FlexibleConnectedPositionStrategy`: origin `bottom/start`, overlay `top/start`. `scrollStrategy: block()`, `hasBackdrop: true`. Panel width via CSS `min-width: 100%`. `OverlayRef` reused across open/close cycles; disposed in `ngOnDestroy`. Panel class: `.bursit-select-panel`.

## Keyboard & ARIA

| Element | Attribute | Managed by |
|---|---|---|
| Trigger | `role="combobox"`, `aria-haspopup="listbox"` | Static host |
| Trigger | `aria-expanded`, `aria-controls` | Host binding from `open()` |
| Trigger | `aria-activedescendant` | `effect()` mirroring listbox via `Renderer2` |
| Trigger | `tabindex`, `aria-required` | Host binding from signals |
| Listbox | `role="listbox"` (auto), `aria-labelledby` (manual) | CDK + manual on panel |
| Options | `role="option"`, `aria-selected` | CDK Option auto |

CDK Listbox handles: ArrowUp/Down, Home, End, Enter (select), Tab (close + advance). SelectComponent handles: Escape (close, focus trigger), trigger Enter/Space (open).

## SCSS

`styles/_select.scss` consuming `--select-*` tokens. Classes: `.bursit-select-trigger`, `.bursit-select-placeholder`, `.bursit-select-value` (ellipsis overflow), `.bursit-select-chevron` (rotates on open), `.bursit-select-panel`, `.bursit-select-option` (hover/focus via `--select-option-hover/focus-*`). States: disabled (`--select-disabled-*`), error (`--select-focus-shadow`). `@media (prefers-reduced-motion)`: instant transitions.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit | Component creation, input signals, ARIA attrs | `TestBed.createComponent`, `componentRef.setInput()`, `getAttribute()` |
| Unit | CVA contract | Direct calls: `writeValue`, `registerOnChange`, `setDisabledState` |
| Unit | Overlay lifecycle | Open, close, destroy-while-open, rapid toggle — assert `dispose` |
| Integration | CDK Listbox → CVA value propagation | Host component via keyboard events |
| Integration | FormField host classes | Nest in `<bursit-form-field>`, assert class toggles |

## Sequences

**Open → Select → Close**: click trigger → `open()` creates overlay → `aria-expanded=true` → first option activates → ArrowDown → activedescendant mirrors → Enter on "B" → `_onChange("B")`, `close()`, `_onTouched()`, focus returns to trigger.

**writeValue while open**: `formControl.setValue("C")` → `writeValue("C")` → `_value.set("C")`, `cdkListbox.selectValue("C")` → trigger updates, dropdown stays open.

No open questions. Ready for `sdd-tasks`.
