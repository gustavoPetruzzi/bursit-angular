const ERROR_SLOT_SELECTOR = '[bursitError], [bursit-error]';
const MESSAGE_SLOT_SELECTOR = '[bursitMessage], [bursit-message]';

/**
 * Resolves the `aria-describedby` value for a control projected into a
 * `bursit-form-field`, using the same `${fieldId}-error` / `${fieldId}-message`
 * id convention as the error and message components.
 *
 * Only a projected `[bursitError]` / `[bursitMessage]` actually renders the
 * matching id, so an unprojected slot must not be referenced: a dangling
 * `aria-describedby` id is announced as a missing description by assistive
 * technology.
 *
 * @param fieldEl The closest `bursit-form-field` ancestor, or `null` when the
 *   control is used standalone.
 * @param fieldId The `FORM_FIELD_ID` of the enclosing field.
 * @returns The space-joined ids that are actually projected, or `null` when
 *   there is nothing to describe.
 */
export function resolveAriaDescribedBy(
  fieldEl: HTMLElement | null,
  fieldId: string | null | undefined,
): string | null {
  if (!fieldId || !fieldEl) {
    return null;
  }

  const ids: string[] = [];
  if (fieldEl.querySelector(ERROR_SLOT_SELECTOR)) {
    ids.push(`${fieldId}-error`);
  }
  if (fieldEl.querySelector(MESSAGE_SLOT_SELECTOR)) {
    ids.push(`${fieldId}-message`);
  }

  return ids.length ? ids.join(' ') : null;
}
