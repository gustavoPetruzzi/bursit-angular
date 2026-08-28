import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Checkbox } from './checkbox';
import { Form, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, signal } from '@angular/core';
import { FormField } from '../form-field';


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
});

function createFormFieldHost(control: FormControl<boolean>, validationInteraction: 'default' | 'touched') {
  @Component({
    template: `
      <bursit-form-field>
        <bursit-checkbox
          [formControl]="control"
          [validationInteraction]="validationInteraction"
        >
          I accept the terms and conditions
        </bursit-checkbox>
      </bursit-form-field>
    `,
    imports: [ReactiveFormsModule, FormField, Checkbox]
  })
  class WrapperComponent {
    control = control;
    validationInteraction = validationInteraction;
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

  it('should wire aria-describedby with the field id when user has not set it', () => {
    const control = new FormControl(false, [Validators.requiredTrue]) as FormControl;
    const { checkboxEl } = createFormFieldHost(control, 'touched');
    const input = checkboxEl.querySelector('input');

    const fieldId = input?.id;
    expect(fieldId).toBeTruthy();
    expect(input?.getAttribute('aria-describedby')).toBe(`${fieldId}-error`);

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