# Exploration: add-checkbox

Issue: https://github.com/gustavoPetruzzi/bursit-angular/issues/7
Date: 2026-08-24

## 1. FormFieldControl contract (existing pattern)

Abstract contract at `projects/bursit-angular/src/lib/forms/form-field/form-field-control.directive.ts`.
Everything is optional; implementers pick what applies:

```ts
export abstract class FormFieldControl<T> {
  readonly type?: FormFieldTypes;
  focused?: Signal<boolean>;
  hovered?: Signal<boolean>;
  invalid?: Signal<boolean>;
  hasValue?: Signal<boolean>;
  disabled?: InputSignal<boolean>;
  clearable?: boolean;
  required?: InputSignal<boolean>;
  hasPlaceholder?: boolean;
  floatingLabel?: InputSignal<boolean>;
  control?: any; // NgControl
}
```

- `FormField` discovers the control with `contentChild(FormFieldControl, { descendants: true })` and derives host classes (`bursit-form-field-error`, `-disabled`, `-required`, etc.) plus the error/message slots (`${fieldId}-error`, `${fieldId}-message`).
- `FORM_FIELD_ID` token provides `bursit-field-N` ids via DI.
- `FormFieldTypes` enum currently: `TEXT_AREA | PIN_ENTRY | SELECT`.

### Reference implementations
- **InputDirective** (`forms/input/input.directive.ts`): attribute directive `input[bursitInput]`; provides itself as `FormFielDControl` via `forwardRef`; syncs signals from `NgControl` (`valueChanges`/`statusChanges`); wires `id` + `aria-describedby="${id}-error ${id}-message"` on the host element when not user-set; uses `queueMicrotask` after blur so `markAsTouched()` lands before re-checking `invalid`.
- **Select** (`forms/select/select.ts`): component implementing `FormFieldControl` + full `ControlValueAccessor`; same id/aria wiring on its internal trigger element in `ngAfterViewInit`.

## 2. What a checkbox cannot reuse vs what still applies

**Does NOT fit:**
- `floatingLabel` / `hasPlaceholder` — meaningless for checkboxes.
- `hasValue` semantics ("filled") — checkbox state is boolean `checked`, not filled-text.
- Floating label layout entirely: label sits beside the box, not inside it.
- Single checkbox + label probably does not need the FormField wrapper at all; groups might.

**Still applies:**
- Provide `FormFieldControl` via `forwardRef` so `invalid()` drives error slot + error styling inside FormField.
- `disabled` model synced from NgControl status.
- `required` → `aria-required` + required indicator.
- `FORM_FIELD_ID` injection → wire `id` + `aria-describedby` so error/message slots link up.
- Native `<input type="checkbox">` needs no ARIA role; indeterminate is a DOM property (`.indeterminate`), not an attribute/state.

## 3. Design tokens (bursit-ui-tokens sibling package)

Checkbox tokens ALREADY exist (`src/components/checkbox.scss`, forwarded from index):
`--checkbox-size`, `--checkbox-border-width/-color/-radius`, `--checkbox-bg`,
`--checkbox-checked-bg/-border-color/-color`, `--checkbox-hover-*`,
`--checkbox-disabled-*`, `--checkbox-check-ease`, `--checkbox-focus-shadow`,
`--checkbox-transition`, `--checkbox-indeterminate-bg/-border-color/-color`,
`--checkbox-error-border-color`, `--checkbox-error-focus-shadow`.

Possibly missing: label gap/color tokens, group spacing tokens. Library-side SCSS entry `_checkbox.scss` does not exist yet (styles dir has button/input/label/modal/textarea).

## 4. Stories pattern

`Meta<XArgs>` with typed args, decorators importing FormField/LabelDirective/Error/Message/ReactiveForms, named template consts (StandaloneTemplate, FormFieldTemplate with real FormControl), stories: Default, Disabled, InsideFormField, Required, ErrorState, WithMessage, Playground, `tags: ['autodocs']`.

## 5. Schematics

No component generator exists (`collection.json` only has `ng-add`). Nothing to update there.

## 6. Public API export chain

`public-api.ts` → `lib/index.ts` → per-folder barrels. Checkbox under `forms/`: add folder + folder `index.ts`, then export from `src/lib/forms/index.ts`.

## Open design questions for proposal phase

1. Standalone usage vs FormField integration (or both)?
2. Indeterminate support in v1?
3. Label API: projected content vs input string? Side position only?
4. Forms integration: ControlValueAccessor (like select) or model() only?
5. Group component (`bursit-checkbox-group`) in scope or follow-up?
6. New FormFieldTypes.CHECKBOX enum value needed?
