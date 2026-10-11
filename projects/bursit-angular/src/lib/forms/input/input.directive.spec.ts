import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputDirective } from './input.directive';
import { FormField } from '../form-field';
import { LabelDirective } from '../label/label.directive';
import { ErrorComponent } from '../error/error.component';
import { MessageComponent } from '../message/message.component';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <form [formGroup]="formGroupDirective">
      <input
        bursitInput
        [formControlName]="'test'"
        [validationInteraction]="validationInteraction"
      />
    </form>
  `,
  imports: [ReactiveFormsModule, InputDirective],
})
class TestHostComponent {
  validationInteraction: 'default' | 'touched' = 'touched';
  control = new FormControl('', [Validators.required]);
  formGroupDirective = new FormGroup({ test: this.control });
}

@Component({
  template: `
    <bursit-form-field>
      <label bursitLabel>Email</label>
      <input
        bursitInput
        [formControl]="control"
        [required]="required"
        [validationInteraction]="validationInteraction"
        [attr.aria-describedby]="describedBy"
      />
      @if (showError) {
        <span bursitError>Enter a valid email</span>
      }
      @if (showMessage) {
        <span bursitMessage>Must be 4-20 characters</span>
      }
    </bursit-form-field>
  `,
  imports: [
    ReactiveFormsModule,
    FormField,
    InputDirective,
    LabelDirective,
    ErrorComponent,
    MessageComponent,
  ],
})
class AriaHostComponent {
  control = new FormControl('', [Validators.required]);
  required = false;
  validationInteraction: 'default' | 'touched' = 'default';
  describedBy: string | null = null;
  showError = false;
  showMessage = false;
}

describe('InputDirective — ARIA contract', () => {
  let fixture: ComponentFixture<AriaHostComponent>;
  let host: AriaHostComponent;
  let input: HTMLInputElement;
  let fieldEl: HTMLElement;

  function create(config?: {
    value?: string;
    required?: boolean;
    validationInteraction?: 'default' | 'touched';
    showError?: boolean;
    showMessage?: boolean;
    describedBy?: string;
  }) {
    fixture = TestBed.createComponent(AriaHostComponent);
    host = fixture.componentInstance;

    if (config?.value !== undefined) host.control.setValue(config.value);
    if (config?.required !== undefined) host.required = config.required;
    if (config?.validationInteraction !== undefined) {
      host.validationInteraction = config.validationInteraction;
    }
    if (config?.showError !== undefined) host.showError = config.showError;
    if (config?.showMessage !== undefined) host.showMessage = config.showMessage;
    if (config?.describedBy !== undefined) host.describedBy = config.describedBy;

    fixture.detectChanges();

    fieldEl = fixture.nativeElement.querySelector('bursit-form-field');
    input = fixture.nativeElement.querySelector('input');

    return { fixture, host, input, fieldEl };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AriaHostComponent],
    }).compileComponents();
  });

  it('should not emit aria-invalid when the control is valid', () => {
    create({ value: 'valid@example.com' });

    expect(host.control.invalid).toBe(false);
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('should emit aria-invalid="true" when the control is invalid', () => {
    create({ value: '', validationInteraction: 'default', showError: true });

    expect(host.control.invalid).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('should drop aria-invalid once the control becomes valid', () => {
    create({ value: '', validationInteraction: 'default' });
    expect(input.getAttribute('aria-invalid')).toBe('true');

    host.control.setValue('valid@example.com');
    fixture.detectChanges();

    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('should keep aria-required="false" when the field is not required', () => {
    create({ value: 'valid@example.com' });

    expect(input.getAttribute('aria-required')).toBe('false');
  });

  it('should emit aria-required="true" when the field is required', () => {
    create({ value: 'valid@example.com', required: true });

    expect(input.getAttribute('aria-required')).toBe('true');
  });

  it('should not emit aria-describedby when neither error nor message is projected', () => {
    create({ value: 'valid@example.com' });

    expect(fieldEl.querySelector('[bursitError]')).toBeNull();
    expect(fieldEl.querySelector('[bursitMessage]')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });

  it('should reference only the message id when a message is projected', () => {
    create({ value: 'valid@example.com', showMessage: true });

    const fieldId = input.id;
    expect(fieldId).toBeTruthy();
    expect(fieldEl.querySelector('[bursitMessage]')).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toBe(`${fieldId}-message`);
  });

  it('should reference only the error id when an error is projected', () => {
    create({ value: '', validationInteraction: 'default', showError: true });

    const fieldId = input.id;
    expect(fieldEl.querySelector('[bursitError]')).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toBe(`${fieldId}-error`);
  });

  it('should reference both ids when an error and a message are projected', () => {
    create({ value: '', validationInteraction: 'default', showError: true, showMessage: true });

    const fieldId = input.id;
    expect(input.getAttribute('aria-describedby')).toBe(`${fieldId}-error ${fieldId}-message`);
  });

  it('should only reference ids that exist in the rendered DOM', () => {
    create({ value: 'valid@example.com', showMessage: true });

    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const ids = describedBy!.split(' ').filter(Boolean);
    expect(ids.length).toBeGreaterThan(0);
    ids.forEach((id) => expect(fieldEl.querySelector(`#${id}`)).toBeTruthy());
  });

  it('should add and drop the error id as the control becomes invalid and valid again', () => {
    create({ value: 'valid@example.com', validationInteraction: 'touched', showError: true });

    const fieldId = input.id;
    expect(input.getAttribute('aria-describedby')).toBeNull();

    host.control.markAsTouched();
    host.control.setValue('');
    fixture.detectChanges();

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(`${fieldId}-error`);

    host.control.setValue('valid@example.com');
    fixture.detectChanges();

    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });

  it('should not override an author-provided aria-describedby', () => {
    create({ value: '', showMessage: true, describedBy: 'custom-hint' });

    expect(input.getAttribute('aria-describedby')).toBe('custom-hint');
  });

  it('should derive the input id from the field id and match the label for', () => {
    create({ value: 'valid@example.com' });

    const label = fieldEl.querySelector('label')!;

    expect(input.id).toMatch(/^bursit-field-\d+$/);
    expect(label.getAttribute('for')).toBe(input.id);
    expect(label.getAttribute('id')).toBe(`${input.id}-label`);
  });
});

describe('InputDirective — validationInteraction=touched + required', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let directive: InputDirective;

  beforeEach(async () => {
    // We need to set up the FormGroupDirective so that the
    // FormControlName directive has a parent to work with.
    // Instead, let's test the directive directly via TestBed.

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, InputDirective],
    }).compileComponents();
  });

  function createWithControl(
    control: FormControl,
    validationInteraction: 'default' | 'touched' = 'touched',
  ) {
    // We use a simple component that projects the directive via reactive forms
    @Component({
      template: `
        <input
          bursitInput
          [formControl]="control"
          [validationInteraction]="validationInteraction"
        />
      `,
      imports: [ReactiveFormsModule, InputDirective],
    })
    class WrapperComponent {
      control = control;
      validationInteraction = validationInteraction;
    }

    const wrapperFixture = TestBed.createComponent(WrapperComponent);
    wrapperFixture.detectChanges();

    const dirEl = wrapperFixture.debugElement.query(By.directive(InputDirective));
    const dir = dirEl.injector.get(InputDirective);

    return { fixture: wrapperFixture, directive: dir, nativeElement: dirEl.nativeElement };
  }

  it('should NOT mark invalid initially when validationInteraction=touched and field is empty+required', () => {
    const control = new FormControl('', [Validators.required]);
    const { directive } = createWithControl(control, 'touched');

    // Initially: control is invalid (required + empty), but untouched
    // With validationInteraction=touched, isInputInvalid should return false
    expect(control.invalid).toBe(true);
    expect(control.touched).toBe(false);
    expect(directive.invalid()).toBe(false);
  });

  it('should mark invalid after control is touched when validationInteraction=touched and field is empty+required', () => {
    const control = new FormControl('', [Validators.required]);
    const { directive, nativeElement } = createWithControl(control, 'touched');

    // Initially not invalid (because untouched)
    expect(directive.invalid()).toBe(false);

    // Simulate user interaction: focus, then blur
    // The directive's onBlur uses queueMicrotask, so we need to flush microtasks
    nativeElement.focus();
    nativeElement.blur();

    // Mark the control as touched (Angular would normally do this via DefaultValueAccessor)
    control.markAsTouched();

    // Flush microtasks (queueMicrotask from onBlur)
    return new Promise<void>((resolve) => {
      queueMicrotask(() => {
        queueMicrotask(() => {
          expect(control.touched).toBe(true);
          expect(control.invalid).toBe(true);
          expect(directive.invalid()).toBe(true);
          resolve();
        });
      });
    });
  });

  it('should NOT mark invalid after touch if validationInteraction is default (it should already be invalid)', () => {
    const control = new FormControl('', [Validators.required]);
    const { directive } = createWithControl(control, 'default');

    // With validationInteraction=default, invalid immediately
    expect(control.invalid).toBe(true);
    expect(directive.invalid()).toBe(true);

    // Touching should keep it invalid
    control.markAsTouched();
    expect(directive.invalid()).toBe(true);
  });

  it('should NOT mark invalid after touch if field has a valid value', () => {
    const control = new FormControl('hello', [Validators.required]);
    const { directive, nativeElement } = createWithControl(control, 'touched');

    // Valid value
    expect(control.invalid).toBe(false);
    expect(directive.invalid()).toBe(false);

    // Touch the control
    nativeElement.focus();
    nativeElement.blur();
    control.markAsTouched();

    // Still valid
    return new Promise<void>((resolve) => {
      queueMicrotask(() => {
        queueMicrotask(() => {
          expect(directive.invalid()).toBe(false);
          resolve();
        });
      });
    });
  });
});
