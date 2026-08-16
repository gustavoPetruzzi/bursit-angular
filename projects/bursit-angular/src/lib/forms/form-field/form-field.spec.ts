import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { FormField } from './form-field';
import { Select } from '../select/select';

@Component({
  template: `
    <bursit-form-field>
      <bursit-select [formControl]="control" />
    </bursit-form-field>
  `,
  imports: [FormField, Select, ReactiveFormsModule],
})
class SelectHostComponent {
  control = new FormControl<string | null>(null);
}

describe('FormField', () => {
  let component: FormField;
  let fixture: ComponentFixture<FormField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormField],
    }).compileComponents();

    fixture = TestBed.createComponent(FormField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the base host class', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('bursit-form-field')).toBe(true);
  });

  it('should not throw when no FormFieldControl or label is projected', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});

describe('FormField with projected Select', () => {
  let fixture: ComponentFixture<SelectHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectHostComponent);
    fixture.detectChanges();
  });

  it('should add the select type class when a select control is projected', () => {
    const host = fixture.nativeElement.querySelector('bursit-form-field') as HTMLElement;
    expect(host.classList.contains('bursit-form-field-type-select')).toBe(true);
  });
});
