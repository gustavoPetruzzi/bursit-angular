import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LabelDirective } from './label.directive';
import { FormField } from '../form-field';
import { InputDirective } from '../input/input.directive';

@Component({
  template: `<label bursitLabel>Test</label>`,
})
class TestHostComponent {}

@Component({
  template: `
    <bursit-form-field>
      <label bursitLabel>Email</label>
      <input bursitInput [formControl]="control" />
    </bursit-form-field>
  `,
  imports: [ReactiveFormsModule, FormField, InputDirective, LabelDirective],
})
class InFormFieldHostComponent {
  control = new FormControl('');
}

describe('LabelDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let labelEl: HTMLLabelElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LabelDirective, TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    labelEl = fixture.nativeElement.querySelector('label')!;
  });

  it('should create an instance', () => {
    expect(labelEl).toBeTruthy();
  });

  it('should not set for when used outside a FormField', () => {
    expect(labelEl.getAttribute('for')).toBeNull();
  });
});

describe('LabelDirective inside a FormField', () => {
  let fixture: ComponentFixture<InFormFieldHostComponent>;
  let fieldEl: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InFormFieldHostComponent],
    });
    fixture = TestBed.createComponent(InFormFieldHostComponent);
    fixture.detectChanges();
    fieldEl = fixture.nativeElement.querySelector('bursit-form-field');
  });

  it('should set for to the generated field id', () => {
    const labelEl = fieldEl.querySelector('label')!;

    expect(labelEl.getAttribute('for')).toMatch(/^bursit-field-\d+$/);
  });

  it('should set id to the field id suffixed with -label', () => {
    const labelEl = fieldEl.querySelector('label')!;
    const forValue = labelEl.getAttribute('for')!;

    expect(labelEl.getAttribute('id')).toBe(`${forValue}-label`);
  });

  it('should point at the projected input through the generated id', () => {
    const labelEl = fieldEl.querySelector('label')!;
    const input = fieldEl.querySelector('input')!;

    expect(input.id).toBe(labelEl.getAttribute('for'));
  });
});
