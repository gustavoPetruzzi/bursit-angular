import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormField } from './form-field';

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
