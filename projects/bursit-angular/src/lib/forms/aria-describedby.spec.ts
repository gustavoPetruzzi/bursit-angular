import { resolveDescribedBy } from './aria-describedby';

const FIELD_ID = 'bursit-field-42';

describe('resolveDescribedBy', () => {
  it('should return null when the field id is missing', () => {
    expect(resolveDescribedBy(null, true, true, true)).toBeNull();
    expect(resolveDescribedBy(undefined, true, true, true)).toBeNull();
    expect(resolveDescribedBy('', true, true, true)).toBeNull();
  });

  it('should return null when nothing is projected', () => {
    expect(resolveDescribedBy(FIELD_ID, false, false, true)).toBeNull();
    expect(resolveDescribedBy(FIELD_ID, false, false, false)).toBeNull();
  });

  it('should return only the error id when an error is projected and the control is invalid', () => {
    expect(resolveDescribedBy(FIELD_ID, true, false, true)).toBe(`${FIELD_ID}-error`);
  });

  it('should return only the message id when a message is projected', () => {
    expect(resolveDescribedBy(FIELD_ID, false, true, true)).toBe(`${FIELD_ID}-message`);
    expect(resolveDescribedBy(FIELD_ID, false, true, false)).toBe(`${FIELD_ID}-message`);
  });

  it('should return both ids in error-then-message order when both are projected', () => {
    expect(resolveDescribedBy(FIELD_ID, true, true, true)).toBe(
      `${FIELD_ID}-error ${FIELD_ID}-message`,
    );
  });

  it('should not reference a declared but currently-valid error', () => {
    // `form-field.html` renders the error slot inside `@if (formFieldControl()?.invalid())`,
    // so a declared error is absent from the DOM while the control is valid. The
    // content-child query still reports the declaration, hence the invalid() guard.
    expect(resolveDescribedBy(FIELD_ID, true, false, false)).toBeNull();
  });

  it('should still describe a projected message while an error is declared but valid', () => {
    expect(resolveDescribedBy(FIELD_ID, true, true, false)).toBe(`${FIELD_ID}-message`);
  });
});
