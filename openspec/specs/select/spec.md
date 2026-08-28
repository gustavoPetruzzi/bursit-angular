# Select Specification

## Purpose

Defines `bursit-select`: a single-select dropdown with keyboard navigation, ARIA accessibility, `ControlValueAccessor` form integration, and `bursit-form-field` compatibility. Uses `@angular/cdk/overlay` for positioning and `@angular/cdk/listbox` for keyboard/ARIA inside the dropdown.

## Requirements

### Requirement: Trigger Rendering

Trigger MUST render placeholder text when no value, selected text when value is set, and a chevron indicator. Dropdown overlay MUST match trigger width (`min-width: 100%`). Options MAY include an optional icon via `<bursit-icon>`.

#### Scenario: Placeholder, value, icon

- GIVEN select with `placeholder="Pick one"` and options [{label: "Apple"}, {label: "Banana", icon: "star"}]
- WHEN no value, trigger displays "Pick one"
- WHEN "Apple" selected, trigger displays "Apple"
- AND Banana renders `<bursit-icon name="star">`

### Requirement: Dropdown Open/Close

Dropdown MUST open on trigger click, Enter, or Space (NOT arrow-down). SHALL close on Escape, outside click, and option selection. Uses `@angular/cdk/overlay` with `FlexibleConnectedPositionStrategy`.

#### Scenario: Open/close lifecycle

- GIVEN closed select
- WHEN trigger clicked or Enter/Space pressed on focused trigger, dropdown opens and `aria-expanded="true"`
- WHEN Escape pressed, closes and focus returns to trigger
- WHEN outside click, closes
- WHEN option selected by click or Enter, closes immediately

### Requirement: Keyboard Navigation

ArrowUp/Down MUST move focus among options. Enter SHALL select. Home/End SHALL jump to first/last. Delegates to `@angular/cdk/listbox`.

#### Scenario: Keyboard navigation

- GIVEN open select with options A,B,C, focus on A
- WHEN ArrowDown, focus moves to B; ArrowUp returns to A
- WHEN Enter on B, B selected and dropdown closes
- WHEN Home, focus jumps to A; End jumps to C
- WHEN ArrowDown on last option, focus stops (no wrap)

### Requirement: ARIA

Trigger MUST have `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-haspopup="listbox"`, `aria-activedescendant`. Dropdown MUST have `role="listbox"` with `aria-labelledby` referencing trigger. Options MUST have `role="option"` with `aria-selected`.

#### Scenario: ARIA wiring

- GIVEN closed select: `role="combobox"`, `aria-expanded="false"`, `aria-haspopup="listbox"`
- WHEN opened: `aria-expanded="true"`, `aria-controls` references listbox id
- WHEN option focused: trigger `aria-activedescendant` references that option
- THEN selected option has `aria-selected="true"`; unselected have `"false"`
- AND listbox `aria-labelledby` references trigger or label

### Requirement: ControlValueAccessor

Select MUST implement `ControlValueAccessor`. `writeValue` updates trigger display. `registerOnChange` fires on selection. `registerOnTouched` fires on close. `setDisabledState` disables trigger and prevents opening.

#### Scenario: CVA lifecycle

- GIVEN select bound to `formControl`
- WHEN `formControl.setValue('X')`, trigger displays "X"
- WHEN option selected, `registerOnChange` fires with value
- WHEN dropdown closes, `registerOnTouched` fires, `formControl.touched` is `true`
- WHEN `formControl.disable()`, trigger disabled and does not open on click

### Requirement: FormField Integration

Select SHALL extend `FormFieldControl`, injecting `NgControl` via `@Self() @Optional()`. Must propagate `focused`, `hovered`, `invalid`, `hasValue`, `disabled` signals. Floating label activates on value. `FormFieldTypes.SELECT` added to enum.

#### Scenario: FormField states

- GIVEN select inside `<bursit-form-field>` with required validator
- WHEN no value + control touched, `invalid()` is `true`, `.bursit-form-field-error` applied
- WHEN value selected, `hasValue()` is `true`, floating label activates
- WHEN focused, `focused()` is `true`, `.bursit-focus` applied

### Requirement: Edge Cases

Select MUST handle: empty options (trigger disabled, no crash), single option (no keyboard loop), long text (ellipsis truncation), rapid open/close (no overlay leaks), destruction while open (overlay disposed), programmatic value while open (trigger updates, dropdown stays open).

#### Scenario: Edge cases

- Zero options: renders without crash, trigger disabled
- One option: ArrowDown/Up do not error or loop
- Long text exceeding width: truncated with ellipsis
- Rapid toggle: overlay creates/disposes cleanly each cycle
- Destroy while open: overlay ref disposed, no leaks
- `writeValue('B')` while open with value A: trigger shows "B", dropdown remains open

### Requirement: Accessibility

Select MUST respect `prefers-reduced-motion` (instant transitions), allow Tab to close and advance focus, and provide semantic roles for screen readers.

#### Scenario: Accessibility

- GIVEN `prefers-reduced-motion: reduce`, open/close transitions are instant
- GIVEN open select with option focused, Tab closes dropdown and moves focus to next element
- GIVEN option selected, screen reader announces value and option count
