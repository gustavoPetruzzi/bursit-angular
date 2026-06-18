import { Component, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelDirective } from './label.directive';

@Component({
  template: `<label bursitLabel>Test</label>`,
})
class TestHostComponent {}

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
