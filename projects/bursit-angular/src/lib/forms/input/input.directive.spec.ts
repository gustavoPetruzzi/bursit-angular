import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputDirective } from './input.directive';
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
