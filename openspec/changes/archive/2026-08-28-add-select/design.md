# Design: Select Component

## Architecture Overview

`Select` (standalone, CVA, FormFieldControl) owns a trigger (`role="combobox"`) and a declarative `<ng-template cdk-connected-overlay>` panel (`role="listbox"`). Options are `<bursit-option>` children projected into the panel; each option self-registers through the injected `BURSIT_SELECT` token. Value flows: option activation → `selectOption()` → CVA `onChange` → form; `writeValue` → value model. Keyboard navigation and `aria-activedescendant` are managed by the component over its own signals (activedescendant pattern — focus stays on the trigger). Mirrors `InputDirective`'s signal patterns for FormFieldControl.

## Component Tree

```
<bursit-form-field>
  <bursit-select>              ← CVA + FormFieldControl + BURSIT_SELECT provider
    <div trigger>              ← combobox, tabindex=0, unified keydown handler
    <ng-template cdk-connected-overlay [cdkConnectedOverlayOpen]="isOpen()">
      <div role="listbox">     ← .bursit-select-panel, deterministic id
        <ng-content>           ← <bursit-option> registers via BURSIT_SELECT token
```

**New**: `select.ts/scss/spec.ts/stories.ts`, `option.ts`, `index.ts`.

**Modified**: `form-field-types.enum.ts` (+`SELECT`), `lib/forms/index.ts`.

## Architecture Decisions

| Decision | Choice | Tradeoff & Rationale |
|---|---|---|
| CVA owner | `Select` owns the full CVA internally (`value` model signal); no CDK Listbox | Single-select contract stays scalar; avoids adapting CDK's `T[]` listbox value shape |
| Overlay strategy | Declarative `<ng-template cdk-connected-overlay>` bound to `isOpen()`; reposition scroll strategy; transparent backdrop closes on outside click | Signal-driven, no imperative `OverlayRef` lifecycle; detach/backdropClick → close — native select UX |
| Panel width | `[cdkConnectedOverlayMatchWidth]="true"` | Built into ConnectedOverlay; no CSS or ResizeObserver needed |
| Active descendant | Component-managed `activeOption` signal mirrored to the trigger via host binding | WAI-ARIA combobox: focus stays on trigger; no CDK Listbox dependency |
| Option value type | `string` inputs (no generic class param) | Matches `FormFieldControl<any>` + simple display values |
| Icon rendering | Content projection (`<ng-content>` in option) | Zero-cost. User controls `<bursit-icon>` size/color |

## Data Flow

```
Click/Enter/Space/ArrowDown/ArrowUp on trigger (closed) → toggle() → isOpen=true → declarative overlay attaches → enabled option matching the current value activates, else NO active option (clean list)
ArrowDown/ArrowUp/Home/End while open → _navigate() → activeOption signal → aria-activedescendant binding (no wrap); active option scrolled into view (`scrollIntoView({block:'nearest'})`)
Enter/Space while open → selectOption(active.value()) → value model + _onChange + _onTouched → close()
Escape → close() + focus returns to trigger; backdrop click/outside detach → onOverlayDetach()

Programmatic writeValue(val):
  value model updated; trigger shows the matching registered option's label, falling back to the raw value string when no option matches
```

## Select Class Design

**Signals**: `placeholder` (InputSignal), `disabled` (ModelSignal, synced from NgControl status), `required`, `floatingLabel`, `ariaLabel` (InputSignals). `focused`, `hovered` (writable Signals, host listeners). `invalid` (synced from NgControl state). `hasValue` (from control/value). `isOpen`, `activeOption`, `options` (writable signals driving the overlay and activedescendant).

**Contract**: `type = FormFieldTypes.SELECT`, `control: NgControl` (injected `@Self() @Optional()`), implements `ControlValueAccessor` + `FormFieldControl<any>`.

**Internal**: `options` registry maintained through `registerOption()`/`unregisterOption()` (called by projected options via the `BURSIT_SELECT` token). `activeOption` drives `.bursit-option-active` styling and the trigger's `aria-activedescendant`. `_enabledOptions()`/`_navigate()`/`_selectActive()` implement keyboard behavior over enabled options. `_onChange`, `_onTouched` — CVA callbacks.

**DI**: `inject(ScrollStrategyOptions)`, `inject(FORM_FIELD_ID, {optional: true})`, `@Self() @Optional() inject(NgControl)`. Provides `FormFieldControl` + `BURSIT_SELECT` via `forwardRef`.

## Option Class Design

Standalone component. `value: InputSignal<string>`, `disabled: InputSignal<boolean>`. Injects `BURSIT_SELECT` optionally; registers itself in `ngOnInit`, unregisters in `ngOnDestroy`; click delegates to `select.selectOption(value())` unless disabled. Host carries a deterministic DOM id (`bursit-select-option-N`) referenced by the trigger's `aria-activedescendant`; selected/active/disabled state exposed as host classes.

## CVA Integration

`writeValue(val)` → value model; trigger label updates reactively. `registerOnChange(fn)` / `registerOnTouched(fn)` → stored. On selection (`selectOption`): value model set, `_onChange(value)`, `_onTouched()`, control resync, `close()`. `_onTouched` also fires when the overlay detaches on outside click (`onOverlayDetach`). Disabled state flows from the NgControl `statusChanges` subscription (`_syncFromControl`); `setDisabledState` is omitted — optional CVA member since Angular v14.

## FormFieldControl Signals

Same contract as `InputDirective`: `focused`, `hovered` (host listeners), `invalid` (synced from NgControl), `hasValue` (from control/value). No `hasPlaceholder` — placeholder IS the default display text.

## Overlay Configuration

Declarative `[cdkConnectedOverlayOpen]="isOpen()"` on an `<ng-template>` in the component template. Position fallbacks: bottom-start → top-start → side placements (`_positions`). `ScrollStrategyOptions.reposition()`. `hasBackdrop` with a transparent backdrop class so outside clicks close via `(detach)`/`(backdropClick)` → `onOverlayDetach()`. Width matched via `cdkConnectedOverlayMatchWidth`. Panel class: `.bursit-select-panel` with deterministic id (`${uid}-listbox`).

## Keyboard & ARIA

| Element | Attribute | Managed by |
|---|---|---|
| Trigger | `role="combobox"`, `aria-haspopup="listbox"` | Static template attributes |
| Trigger | `aria-expanded`, `aria-controls` | Template bindings from `isOpen()` / `panelId` |
| Trigger | `aria-activedescendant` | `activeDescendantId` computed from `activeOption()` |
| Trigger | `tabindex`, `aria-required`, `aria-disabled`, `aria-invalid` | Template bindings from signals |
| Panel | `role="listbox"`, deterministic id (`${uid}-listbox`) | Template binding |
| Option host | deterministic id (`bursit-select-option-N`) | Option host binding |
| Options | `role="option"`, `aria-selected`, `aria-disabled` | Option template |

Component keyboard handling (focus stays on the trigger): ArrowDown/ArrowUp while closed open the dropdown (native `<select>` behavior — maintainer decision 2026-08-24, reversing the earlier "arrows do not open" spec decision); ArrowUp/ArrowDown/Home/End while open move `activeOption` across enabled options without wrapping, scrolling the active option into view. On open, activation prefers the enabled option matching the current value; with no current value, a disabled/unmatched value, or zero enabled options, NO option is active (clean list, no `aria-activedescendant`). Navigation from that null state works: ArrowDown/Home activate the first enabled option, ArrowUp/End the last. Enter/Space select the active option while open, or open while closed; with nothing active they just close. Escape closes and returns focus to the trigger; Tab closes the panel when open without `preventDefault`, so focus continues its natural tab order. Click toggles. The trigger renders the matching option's projected label text rather than the raw value string (raw value shown as fallback for unmatched programmatic values).

## SCSS

Component-scoped `select.scss` consuming `--select-*` tokens: host min-width/disabled state, `.bursit-select-trigger`, `.bursit-select-value` (ellipsis overflow), `.bursit-select-placeholder`, chevron rotation via `[aria-expanded='true'] bursit-icon`, `.bursit-select-panel`. Option styling in `option.scss` consuming `--select-option-*` tokens with hover/focus/disabled states.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit | Component creation, input signals, ARIA attrs | `TestBed.createComponent`, `componentRef.setInput()`, `getAttribute()` |
| Unit | CVA contract | Reactive-form host + direct calls (`selectOption`, `onOverlayDetach`) |
| Unit | Overlay lifecycle | Open/close/toggle/detach through TestHost interactions |
| Integration | Keyboard navigation → value propagation | Host with projected options, dispatched `KeyboardEvent`s |
| Integration | FormField host classes | Nest in `<bursit-form-field>`, assert class toggles |

## Sequences

**Open → Select → Close**: click trigger → `toggle()` → overlay attaches → clean list (no active option without a current value) → ArrowDown activates the first enabled option → Enter on "Gamma" (second ArrowDown) → value model + `_onChange("gamma")`, `close()`, `_onTouched()`, focus returns to trigger.

**writeValue while open**: `formControl.setValue("C")` → `writeValue("C")` → value model updated → trigger label updates; dropdown stays open.

No open questions. Ready for `sdd-tasks`.
