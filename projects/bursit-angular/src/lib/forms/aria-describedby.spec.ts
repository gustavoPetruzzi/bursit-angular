import { resolveAriaDescribedBy } from './aria-describedby';

const FIELD_ID = 'bursit-field-42';

describe('resolveAriaDescribedBy', () => {
  let fieldEl: HTMLElement;

  function project(html: string): void {
    fieldEl.innerHTML = html;
  }

  beforeEach(() => {
    fieldEl = document.createElement('bursit-form-field');
    document.body.appendChild(fieldEl);
  });

  afterEach(() => {
    fieldEl.remove();
  });

  it('should return null when the field element is null', () => {
    expect(resolveAriaDescribedBy(null, FIELD_ID)).toBeNull();
  });

  it('should return null when the field id is missing', () => {
    project('<span bursitError>Boom</span><span bursitMessage>Hint</span>');

    expect(resolveAriaDescribedBy(fieldEl, null)).toBeNull();
    expect(resolveAriaDescribedBy(fieldEl, undefined)).toBeNull();
    expect(resolveAriaDescribedBy(fieldEl, '')).toBeNull();
  });

  it('should return null when neither slot is projected', () => {
    project('<input bursitInput />');

    expect(resolveAriaDescribedBy(fieldEl, FIELD_ID)).toBeNull();
  });

  it('should return only the error id when only an error is projected', () => {
    project('<span bursitError>Boom</span>');

    expect(resolveAriaDescribedBy(fieldEl, FIELD_ID)).toBe(`${FIELD_ID}-error`);
  });

  it('should return only the message id when only a message is projected', () => {
    project('<span bursitMessage>Hint</span>');

    expect(resolveAriaDescribedBy(fieldEl, FIELD_ID)).toBe(`${FIELD_ID}-message`);
  });

  it('should return both ids in error-then-message order when both are projected', () => {
    project('<span bursitMessage>Hint</span><span bursitError>Boom</span>');

    expect(resolveAriaDescribedBy(fieldEl, FIELD_ID)).toBe(`${FIELD_ID}-error ${FIELD_ID}-message`);
  });

  it('should honour the kebab-case slot aliases', () => {
    project('<span bursit-error>Boom</span>');
    expect(resolveAriaDescribedBy(fieldEl, FIELD_ID)).toBe(`${FIELD_ID}-error`);

    project('<span bursit-message>Hint</span>');
    expect(resolveAriaDescribedBy(fieldEl, FIELD_ID)).toBe(`${FIELD_ID}-message`);
  });

  it('should ignore look-alike attributes that are not slot projections', () => {
    project('<span data-bursitError>Boom</span><span bursitErrorLabel>Boom</span>');

    expect(resolveAriaDescribedBy(fieldEl, FIELD_ID)).toBeNull();
  });

  it('should reflect slots added and removed after the first call', () => {
    project('<span bursitMessage>Hint</span>');
    expect(resolveAriaDescribedBy(fieldEl, FIELD_ID)).toBe(`${FIELD_ID}-message`);

    project('');
    expect(resolveAriaDescribedBy(fieldEl, FIELD_ID)).toBeNull();

    project('<span bursitError>Boom</span>');
    expect(resolveAriaDescribedBy(fieldEl, FIELD_ID)).toBe(`${FIELD_ID}-error`);
  });

  it('should keep ids scoped to the given field element', () => {
    const other = document.createElement('bursit-form-field');
    document.body.appendChild(other);
    other.innerHTML = '<span bursitError>Other</span>';
    project('<span bursitMessage>Hint</span>');

    expect(resolveAriaDescribedBy(fieldEl, FIELD_ID)).toBe(`${FIELD_ID}-message`);
    expect(resolveAriaDescribedBy(other, 'bursit-field-99')).toBe('bursit-field-99-error');

    other.remove();
  });
});
