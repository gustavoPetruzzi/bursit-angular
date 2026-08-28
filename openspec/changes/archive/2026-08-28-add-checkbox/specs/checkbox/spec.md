# Checkbox Specification

## Purpose

Defines `bursit-checkbox`: a boolean selection control with a native `<input type="checkbox">`, projected label content, checked/unchecked/indeterminate states, `ControlValueAccessor` form integration, and `bursit-form-field` compatibility.

## Requirements

### Requirement: Rendering and Label Association

Checkbox MUST render a native `<input type="checkbox">` plus projected label content displayed beside the box. The label MUST be associated with the input (`for`/`id` or wrapping) so clicking the label text toggles the checkbox. Projected content MUST NOT be required — a bare `<bursit-checkbox>` SHALL render without crash.

#### Scenario: Label toggle

- GIVEN `<bursit-checkbox><span>Acepto términos</span></bursit-checkbox>`
- WHEN the user clicks the span text, the checkbox toggles
- WHEN the user clicks the box itself, it toggles exactly once (no double-toggle)

### Requirement: Selection State

Checkbox MUST reflect and emit its boolean checked state. Clicking or pressing Space on a focused checkbox toggles it. State MUST be visible via host class for styling.

#### Scenario: Toggle interactions

- GIVEN an unchecked enabled checkbox
- WHEN clicked, checked becomes true; WHEN clicked again, false
- WHEN focused and Space pressed, state toggles

### Requirement: Indeterminate State

Checkbox MAY expose an indeterminate input. Indeterminate MUST be visual/view-state only: it SHALL NOT alter the FormControl value and SHALL be cleared visually when toggled by user interaction. Screen readers announce mixed state via native semantics.

#### Scenario: Indeterminate lifecycle

- GIVEN `[indeterminate]="true"` with unchecked box
- WHEN rendered, the box shows indeterminate styling (token-driven) but form value stays `false`
- WHEN user clicks it, indeterminate visual clears and value becomes `true`

### Requirement: ControlValueAccessor

Checkbox MUST implement `ControlValueAccessor`. `writeValue(boolean)` updates checked state. Toggling fires `registerOnChange` with the new boolean. Blur fires `registerOnTouched`. `setDisabledState` disables the input.

#### Scenario: CVA lifecycle

- GIVEN bound to `formControl` with initial `false`
- WHEN `formControl.setValue(true)`, box renders checked
- WHEN user checks the box, `onChange(true)` fires and control value is `true`
- WHEN focus leaves after interaction, control becomes touched
- WHEN `formControl.disable()`, input is disabled and non-interactive

### Requirement: FormField Integration

When placed inside `<bursit-form-field>`, checkbox SHALL provide `FormFieldControl` so that `invalid()`, `disabled()`, and `required()` propagate to field classes and error/message slots. It MUST wire `id` and `aria-describedby` (`${fieldId}-error ${fieldId}-message`) when the user has not set them. Floating-label and placeholder contract members are intentionally NOT implemented.

#### Scenario: Error wiring inside FormField

- GIVEN checkbox inside form-field, bound to a required `FormControl(false)` shown as invalid
- WHEN invalid, `.bursit-form-field-error` applies and error slot renders with matching `aria-describedby`
- WHEN `disabled()` is true, field gets disabled class

### Requirement: Accessibility

Native input semantics MUST be preserved (no ARIA role overrides). Focus MUST show the token-defined focus ring (`--checkbox-focus-shadow`). Disabled checkboxes SHALL be excluded from tab order by native behavior.

#### Scenario: Keyboard and focus

- GIVEN enabled checkbox, Tab moves focus onto it and focus ring is visible
- WHEN disabled, Tab skips it and click/keyboard do nothing

### Requirement: Edge Cases

Checkbox MUST handle: programmatic `writeValue` while indeterminate (value wins, visual syncs), rapid toggling (state stays consistent), and destruction during interaction (no errors).

#### Scenario: Programmatic write while indeterminate

- GIVEN indeterminate visual active
- WHEN `writeValue(true)`, box shows checked, no indeterminate residue, onChange not fired by the write itself
