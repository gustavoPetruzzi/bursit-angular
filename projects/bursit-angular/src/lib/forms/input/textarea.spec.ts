import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputDirective } from './input.directive';
import { By } from '@angular/platform-browser';

describe('InputDirective on textarea — validationInteraction', () => {
  let fixture: ComponentFixture<unknown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, InputDirective],
    }).compileComponents();
  });

  function createWithControl(
    control: FormControl,
    validationInteraction: 'default' | 'touched' = 'touched',
  ) {
    @Component({
      template: `
        <textarea
          bursitInput
          [formControl]="control"
          [validationInteraction]="validationInteraction"
        ></textarea>
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

  it('should NOT mark invalid initially when validationInteraction=touched and empty+required', () => {
    const control = new FormControl('', [Validators.required]);
    const { directive } = createWithControl(control, 'touched');

    expect(control.invalid).toBe(true);
    expect(control.touched).toBe(false);
    expect(directive.invalid()).toBe(false);
  });

  it('should mark invalid after control is touched when validationInteraction=touched and empty+required', () => {
    const control = new FormControl('', [Validators.required]);
    const { directive, nativeElement } = createWithControl(control, 'touched');

    expect(directive.invalid()).toBe(false);

    nativeElement.focus();
    nativeElement.blur();
    control.markAsTouched();

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

  it('should be invalid immediately when validationInteraction=default and empty+required', () => {
    const control = new FormControl('', [Validators.required]);
    const { directive } = createWithControl(control, 'default');

    expect(control.invalid).toBe(true);
    expect(directive.invalid()).toBe(true);

    control.markAsTouched();
    expect(directive.invalid()).toBe(true);
  });

  it('should NOT mark invalid after touch if field has a valid value', () => {
    const control = new FormControl('hello', [Validators.required]);
    const { directive, nativeElement } = createWithControl(control, 'touched');

    expect(control.invalid).toBe(false);
    expect(directive.invalid()).toBe(false);

    nativeElement.focus();
    nativeElement.blur();
    control.markAsTouched();

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
