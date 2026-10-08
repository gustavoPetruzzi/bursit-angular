/**
 * Resolves the `aria-describedby` value for a control from the state of its
 * enclosing `bursit-form-field`, using the same `${fieldId}-error` /
 * `${fieldId}-message` id convention as the error and message components.
 *
 * Pure and DOM-free by design: the caller supplies the projected-slot state
 * (from the field's `contentChild` queries) and validity, so no component ever
 * reaches into another's DOM.
 *
 * `form-field.html` renders the error slot inside exactly
 * `@if (formFieldControl()?.invalid())` while the message slot is
 * unconditional, so:
 *
 *   error slot present   === hasError && invalid
 *   message slot present === hasMessage
 *
 * Keep this formula in sync with that template: a declared error must not be
 * referenced while the control is valid, or the reference dangles.
 *
 * @param fieldId The `FORM_FIELD_ID` of the enclosing field, or a falsy value
 *   when the control is used standalone.
 * @param hasError Whether an `[bursitError]` was declared.
 * @param hasMessage Whether a `[bursitMessage]` was declared.
 * @param invalid Whether the control is currently invalid.
 * @returns The space-joined ids in error-then-message order, or `null` when
 *   there is nothing to describe.
 */
export function resolveDescribedBy(
  fieldId: string | null | undefined,
  hasError: boolean,
  hasMessage: boolean,
  invalid: boolean,
): string | null {
  if (!fieldId) {
    return null;
  }

  const ids: string[] = [];
  if (hasError && invalid) {
    ids.push(`${fieldId}-error`);
  }
  if (hasMessage) {
    ids.push(`${fieldId}-message`);
  }

  return ids.length ? ids.join(' ') : null;
}
