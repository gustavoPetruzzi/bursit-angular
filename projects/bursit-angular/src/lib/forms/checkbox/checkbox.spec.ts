import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Checkbox } from './checkbox';
import { Form, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, signal } from '@angular/core';
import { FormField } from '../form-field';
import { ErrorComponent } from '../error/error.component';
import { MessageComponent } from '../message/message.component';


@Component({
  template: `
    <bursit-checkbox
      [formControl]="control"
     />
  `,
  imports: [ReactiveFormsModule, Checkbox]
})
class TestHostComponent {
  control = new FormControl<boolean>(false);

}

function setup() {
  TestBed.configureTestingModule({
    imports: [TestHostComponent],
  });

  const fixture = TestBed.createComponent(TestHostComponent);
  const host = fixture.componentInstance;


  fixture.detectChanges();

  const checkboxDebug = fixture.debugElement.query(By.directive(Checkbox));
  const checkbox: Checkbox = checkboxDebug.componentInstance;
  return { host, fixture, checkbox, checkboxEl: checkboxDebug.nativeElement as HTMLElement };
}

describe('Checkbox', () => {
  
  it('should create', () => {
    const { checkbox } = setup();
    expect(checkbox).toBeTruthy();
  });

  it('should render a native checkbox', () => {
    const { checkboxEl } = setup();
    const input = checkboxEl.querySelector('input');
    expect(input?.type).toBe('checkbox');
  });

  it('should toggle on clicked', () => {
    const { checkboxEl, fixture, host } = setup();
    const input = checkboxEl.querySelector('input');
    input?.click();
    fixture.detectChanges();

    expect(input?.checked).toBe(true);
    expect(host.control.value).toBe(true);

    input?.click();
    fixture.detectChanges();

    expect(input?.checked).toBe(false);
    expect(host.control.value).toBe(false);
    
  });

  it('should set focused signal on focus', () => {
    const { checkboxEl, checkbox } = setup();
    const input = checkboxEl.querySelector('input');
    input?.dispatchEvent(new Event('focus'));

    expect(checkbox.focused()).toBe(true);
  });

  it('should mark control touched on blur', () => {
    const { checkboxEl, fixture, host } = setup();
    const input = checkboxEl.querySelector('input');

    input?.dispatchEvent(new Event('focus'));
    input?.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(host.control.touched).toBe(true);
  });

  it('should not set aria-describedby when used outside a form-field', () => {
    const { checkboxEl } = setup();
    const input = checkboxEl.querySelector('input');

    expect(input?.closest('bursit-form-field')).toBeNull();
    expect(input?.getAttribute('aria-describedby')).toBeNull();
  });
});

interface FormFieldHostSlots {
  showError?: boolean;
  showMessage?: boolean;
}

function createFormFieldHost(
  control: FormControl<boolean>,
  validationInteraction: 'default' | 'touched',
  slots: FormFieldHostSlots = {},
) {
  @Component({
    template: `
      <bursit-form-field>
        <bursit-checkbox
          [formControl]="control"
          [validationInteraction]="validationInteraction"
        >
          I accept the terms and conditions
        </bursit-checkbox>
        @if (showError) {
          <span bursitError>You must accept the terms and conditions</span>
        }
        @if (showMessage) {
          <span bursitMessage>We never share your preferences</span>
        }
      </bursit-form-field>
    `,
    imports: [ReactiveFormsModule, FormField, Checkbox, ErrorComponent, MessageComponent],
  })
  class WrapperComponent {
    control = control;
    validationInteraction = validationInteraction;
    showError = slots.showError ?? false;
    showMessage = slots.showMessage ?? false;
  }

  const fixture = TestBed.createComponent(WrapperComponent);
  fixture.detectChanges();
  const checkboxDebug = fixture.debugElement.query(By.directive(Checkbox));
  const checkbox = checkboxDebug.componentInstance as Checkbox;
  const checkboxEl = checkboxDebug.nativeElement as HTMLElement;
  const formFieldEl = fixture.debugElement.query(By.directive(FormField)).nativeElement as HTMLElement;

  return { fixture, control, checkbox, checkboxEl, formFieldEl };

}

describe('Checkbox in FormField', () => {
  it('should NOT mark the form-field host as error initially when validationInteraction=touched', () => {
    const control = new FormControl(false, [Validators.requiredTrue]) as FormControl<boolean>;
    const { formFieldEl } = createFormFieldHost(control, 'touched');

    expect(control.invalid).toBe(true);
    expect(control.touched).toBe(false);
    expect(formFieldEl.classList.contains('bursit-form-field-error')).toBe(false);
  });

  it('should mark the form-field host as error after touch when validationInteraction=touched', () => {
    const control = new FormControl(false, [Validators.requiredTrue]) as FormControl;
    const { formFieldEl, checkboxEl, fixture } = createFormFieldHost(control, 'touched');
    const input = checkboxEl.querySelector('input');

    input?.dispatchEvent(new Event('focus'));
    input?.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(control.invalid).toBe(true);
    expect(control.touched).toBe(true);
    expect(formFieldEl.classList.contains('bursit-form-field-error')).toBe(true);
  });

  it('should mark the form-field host as error immediately when validationInteraction=default and control is invalid', () => {
    const control = new FormControl(false, [Validators.requiredTrue]) as FormControl;
    const { formFieldEl } = createFormFieldHost(control, 'default');

    expect(control.invalid).toBe(true);
    expect(control.touched).toBe(false);
    expect(formFieldEl.classList.contains('bursit-form-field-error')).toBe(true);
  });

  it('should clear the form-field host error when the control becomes valid', () => {
    const control = new FormControl(false, [Validators.requiredTrue]) as FormControl;
    const { formFieldEl, fixture } = createFormFieldHost(control, 'default');

    expect(formFieldEl.classList.contains('bursit-form-field-error')).toBe(true);

    control.setValue(true);
    fixture.detectChanges();

    expect(control.invalid).toBe(false);
    expect(formFieldEl.classList.contains('bursit-form-field-error')).toBe(false);
  });

  it('should set aria-invalid on the native input when invalid', () => {
    const control = new FormControl(false, [Validators.requiredTrue]) as FormControl;
    const { checkboxEl, fixture } = createFormFieldHost(control, 'default');
    const input = checkboxEl.querySelector('input');

    expect(input?.getAttribute('aria-invalid')).toBe('true');

    control.setValue(true);
    fixture.detectChanges();

    expect(input?.getAttribute('aria-invalid')).toBeNull();
  });

  it('should NOT set aria-describedby when neither an error nor a message is projected', () => {
    const control = new FormControl(false, [Validators.requiredTrue]) as FormControl;
    const { checkboxEl, formFieldEl } = createFormFieldHost(control, 'touched');
    const input = checkboxEl.querySelector('input');

    const fieldId = input?.id;
    expect(fieldId).toBeTruthy();
    expect(formFieldEl.querySelector('[bursitError]')).toBeNull();
    expect(formFieldEl.querySelector('[bursitMessage]')).toBeNull();
    // A dangling reference is announced by assistive technology as a missing
    // description, so the attribute must stay absent rather than name an id that
    // is not in the DOM.
    expect(input?.getAttribute('aria-describedby')).toBeNull();
  });

  it('should propagate disabled state to the form-field host class', () => {
    const control = new FormControl(false, [Validators.requiredTrue]) as FormControl;
    const { formFieldEl, fixture } = createFormFieldHost(control, 'touched');
    
    expect(formFieldEl.classList.contains('bursit-form-field-disabled')).toBe(false);

    control.disable();
    fixture.detectChanges();

expect(formFieldEl.classList.contains('bursit-form-field-disabled')).toBe(true);

  });
});

// ---------------------------------------------------------------------------
// Tests — ARIA describedby contract (only projected slots are referenced)
// ---------------------------------------------------------------------------

describe('Checkbox — aria-describedby contract', () => {
  function create(config?: {
    value?: boolean;
    validationInteraction?: 'default' | 'touched';
    showError?: boolean;
    showMessage?: boolean;
  }) {
    const control = new FormControl(config?.value ?? false, [
      Validators.requiredTrue,
    ]) as FormControl<boolean>;

    const { fixture, checkbox, checkboxEl, formFieldEl } = createFormFieldHost(
      control,
      config?.validationInteraction ?? 'default',
      { showError: config?.showError, showMessage: config?.showMessage },
    );

    const input = checkboxEl.querySelector('input') as HTMLInputElement;

    return { fixture, control, checkbox, checkboxEl, formFieldEl, input };
  }

  it('should not emit aria-describedby when neither error nor message is projected', () => {
    const { formFieldEl, input } = create({ value: true });

    expect(input.id).toMatch(/^bursit-field-\d+$/);
    expect(formFieldEl.querySelector('[bursitError]')).toBeNull();
    expect(formFieldEl.querySelector('[bursitMessage]')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });

  it('should reference only the error id when an error is projected', () => {
    const { formFieldEl, input } = create({ value: false, showError: true });

    const fieldId = input.id;
    expect(formFieldEl.querySelector('[bursitError]')).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toBe(`${fieldId}-error`);
    expect(formFieldEl.querySelector(`#${fieldId}-error`)).toBeTruthy();
  });

  it('should reference only the message id when a message is projected', () => {
    const { formFieldEl, input } = create({ value: true, showMessage: true });

    const fieldId = input.id;
    expect(formFieldEl.querySelector('[bursitMessage]')).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toBe(`${fieldId}-message`);
    expect(formFieldEl.querySelector(`#${fieldId}-message`)).toBeTruthy();
  });

  it('should reference both ids when an error and a message are projected', () => {
    const { formFieldEl, input } = create({ value: false, showError: true, showMessage: true });

    const fieldId = input.id;
    expect(input.getAttribute('aria-describedby')).toBe(`${fieldId}-error ${fieldId}-message`);
    expect(formFieldEl.querySelector(`#${fieldId}-error`)).toBeTruthy();
    expect(formFieldEl.querySelector(`#${fieldId}-message`)).toBeTruthy();
  });

  it('should not reference the error id while the control is valid, even if an error is projected', () => {
    const { formFieldEl, input } = create({ value: true, showError: true });

    const fieldId = input.id;
    // The form-field only renders the error slot while the control is invalid.
    expect(formFieldEl.querySelector('[bursitError]')).toBeNull();
    expect(formFieldEl.querySelector(`#${fieldId}-error`)).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });

  it('should only reference ids that exist in the rendered DOM', () => {
    const { formFieldEl, input } = create({ value: false, showError: true, showMessage: true });

    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const ids = (describedBy as string).split(' ').filter(Boolean);
    expect(ids.length).toBe(2);
    ids.forEach((id) => expect(formFieldEl.querySelector(`#${id}`)).toBeTruthy());
    expect(formFieldEl.querySelector('[bursitError]')).toBeTruthy();
    expect(formFieldEl.querySelector('[bursitMessage]')).toBeTruthy();
  });

  it('should not override an author-provided aria-describedby', () => {
    const { checkbox, formFieldEl, input } = create({
      value: false,
      showError: true,
      showMessage: true,
    });

    input.setAttribute('aria-describedby', 'custom-hint');
    checkbox.ngAfterViewInit();

    expect(input.getAttribute('aria-describedby')).toBe('custom-hint');
    expect(formFieldEl.querySelector('#custom-hint')).toBeNull();
  });

  it('should keep aria-describedby current when validity flips in both directions', () => {
    const { control, formFieldEl, input, fixture } = create({ value: true, showError: true });

    const fieldId = input.id;
    expect(fieldId).toMatch(/^bursit-field-\d+$/);
    // Valid: the @if-gated error slot is not rendered, so nothing may dangle.
    expect(formFieldEl.querySelector('[bursitError]')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBeNull();

    control.setValue(false);
    fixture.detectChanges();

    // Invalid: the error element is in the DOM, so the reference must appear.
    expect(formFieldEl.querySelector('[bursitError]')).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toBe(`${fieldId}-error`);
    expect(formFieldEl.querySelector(`#${fieldId}-error`)).toBeTruthy();

    control.setValue(true);
    fixture.detectChanges();

    // Back to valid: the reference must be REMOVED, not left stale.
    expect(formFieldEl.querySelector('[bursitError]')).toBeNull();
    expect(formFieldEl.querySelector(`#${fieldId}-error`)).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });

  it('should only reference ids that resolve in the DOM across validity flips', () => {
    const { control, formFieldEl, input, fixture } = create({
      value: true,
      showError: true,
      showMessage: true,
    });

    const fieldId = input.id;
    expect(formFieldEl.querySelector('[bursitError]')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBe(`${fieldId}-message`);

    control.setValue(false);
    fixture.detectChanges();

    // Every referenced id must resolve via querySelector, so a stale or
    // dangling reference cannot pass on string comparison alone.
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBe(`${fieldId}-error ${fieldId}-message`);
    const ids = (describedBy as string).split(' ').filter(Boolean);
    expect(ids.length).toBe(2);
    ids.forEach((id) => expect(formFieldEl.querySelector(`#${id}`)).toBeTruthy());

    control.setValue(true);
    fixture.detectChanges();

    expect(formFieldEl.querySelector('[bursitError]')).toBeNull();
    expect(formFieldEl.querySelector(`#${fieldId}-error`)).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBe(`${fieldId}-message`);
    expect(formFieldEl.querySelector(`#${fieldId}-message`)).toBeTruthy();
  });

  it('should remove a stale aria-describedby when an invalid control becomes valid', () => {
    const { control, formFieldEl, input, fixture } = create({
      value: false,
      showError: true,
      showMessage: true,
    });

    const fieldId = input.id;
    expect(input.getAttribute('aria-describedby')).toBe(`${fieldId}-error ${fieldId}-message`);
    expect(formFieldEl.querySelector(`#${fieldId}-error`)).toBeTruthy();

    control.setValue(true);
    fixture.detectChanges();

    expect(formFieldEl.querySelector('[bursitError]')).toBeNull();
    expect(formFieldEl.querySelector(`#${fieldId}-error`)).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBe(`${fieldId}-message`);
  });

  it('should not override an author-provided aria-describedby across validity transitions', () => {
    const { checkbox, control, input, fixture } = create({ value: true, showError: true });

    input.setAttribute('aria-describedby', 'custom-hint');
    checkbox.ngAfterViewInit();
    fixture.detectChanges();
    expect(input.getAttribute('aria-describedby')).toBe('custom-hint');

    control.setValue(false);
    fixture.detectChanges();
    expect(input.getAttribute('aria-describedby')).toBe('custom-hint');

    control.setValue(true);
    fixture.detectChanges();
    expect(input.getAttribute('aria-describedby')).toBe('custom-hint');
  });
});
