import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { Select } from './select';
import { FormFieldTypes } from '../form-field/form-field-types.enum';

// ---------------------------------------------------------------------------
// Test host — wraps Select inside a reactive form
// ---------------------------------------------------------------------------

@Component({
  template: `
    <bursit-select
      [formControl]="control"
      [placeholder]="placeholder()"
      [required]="required()"
      [floatingLabel]="floatingLabel()"
    />
  `,
  imports: [ReactiveFormsModule, Select],
})
class TestHostComponent {
  control = new FormControl<string | null>(null);
  placeholder = signal('Choose an option');
  required = signal(false);
  floatingLabel = signal(false);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setup(overrides?: { required?: boolean; floatingLabel?: boolean }) {
  TestBed.configureTestingModule({
    imports: [TestHostComponent],
  });

  const fixture = TestBed.createComponent(TestHostComponent);
  const host = fixture.componentInstance;

  if (overrides?.required) host.required.set(true);
  if (overrides?.floatingLabel) host.floatingLabel.set(true);

  fixture.detectChanges();

  const selectDebug = fixture.debugElement.query(By.directive(Select));
  const select: Select = selectDebug.componentInstance;

  return { fixture, host, select, selectEl: selectDebug.nativeElement as HTMLElement };
}

// ---------------------------------------------------------------------------
// Tests — PR 1: Foundation + Component Core (RED)
// ---------------------------------------------------------------------------

describe('Select — PR 1 (Foundation)', () => {
  // -----------------------------------------------------------------------
  // 1. Creation
  // -----------------------------------------------------------------------

  it('should create', () => {
    const { select } = setup();
    expect(select).toBeTruthy();
  });

  // -----------------------------------------------------------------------
  // 2. Placeholder
  // -----------------------------------------------------------------------

  it('should render placeholder text when no value is selected', () => {
    const { selectEl } = setup();

    const placeholder = selectEl.querySelector('.bursit-select-placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder?.textContent?.trim()).toBe('Choose an option');
  });

  it('should NOT show placeholder when a value is selected', () => {
    const { host, fixture, selectEl } = setup();

    host.control.setValue('option-a');
    fixture.detectChanges();

    const placeholder = selectEl.querySelector('.bursit-select-placeholder');
    expect(placeholder).toBeFalsy();
  });

  // -----------------------------------------------------------------------
  // 3. Disabled
  // -----------------------------------------------------------------------

  it('should apply disabled attribute and class when control is disabled', () => {
    const { host, fixture, selectEl } = setup();

    host.control.disable();
    fixture.detectChanges();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
    expect(selectEl.classList.contains('bursit-select-disabled')).toBe(true);
  });

  it('should NOT be disabled by default', () => {
    const { selectEl } = setup();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-disabled')).toBeNull();
    expect(selectEl.classList.contains('bursit-select-disabled')).toBe(false);
  });

  // -----------------------------------------------------------------------
  // 4. Focused signal
  // -----------------------------------------------------------------------

  it('should set focused signal to true on trigger focus', () => {
    const { select, selectEl } = setup();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new Event('focus'));

    expect(select.focused()).toBe(true);
  });

  it('should set focused signal to false on trigger blur', () => {
    const { select, selectEl } = setup();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new Event('focus'));
    trigger.dispatchEvent(new Event('blur'));

    expect(select.focused()).toBe(false);
  });

  // -----------------------------------------------------------------------
  // 5. Hovered signal
  // -----------------------------------------------------------------------

  it('should set hovered signal to true on mouseenter', () => {
    const { select, selectEl } = setup();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new Event('mouseenter'));

    expect(select.hovered()).toBe(true);
  });

  it('should set hovered signal to false on mouseleave', () => {
    const { select, selectEl } = setup();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new Event('mouseenter'));
    trigger.dispatchEvent(new Event('mouseleave'));

    expect(select.hovered()).toBe(false);
  });

  // -----------------------------------------------------------------------
  // 6. FormFieldControl contract
  // -----------------------------------------------------------------------

  it('should expose type = FormFieldTypes.SELECT', () => {
    const { select } = setup();
    expect(select.type).toBe(FormFieldTypes.SELECT);
  });

  it('should expose required signal from input', () => {
    const { select } = setup({ required: true });
    expect(select.required()).toBe(true);
  });

  it('should expose floatingLabel signal from input', () => {
    const { select } = setup({ floatingLabel: true });
    expect(select.floatingLabel()).toBe(true);
  });

  // -----------------------------------------------------------------------
  // 7. NgControl injection
  // -----------------------------------------------------------------------

  it('should inject NgControl when used with formControl', () => {
    const { select, host } = setup();
    expect(select.control).toBeTruthy();
    expect(select.control?.control).toBe(host.control as any);
  });

  it('should compute invalid signal from NgControl validation', () => {
    const { select, host, fixture, selectEl } = setup();

    host.control.setValidators(Validators.required);
    host.control.setValue(null);
    host.control.markAsTouched();

    // Simulate user leaving the field — blur triggers invalidation check
    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    expect(select.invalid()).toBe(true);
  });

  it('should compute hasValue signal from NgControl value', () => {
    const { select, host, fixture } = setup();

    expect(select.hasValue()).toBe(false);

    host.control.setValue('selected-value');
    fixture.detectChanges();

    expect(select.hasValue()).toBe(true);
  });
});
