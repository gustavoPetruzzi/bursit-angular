import { Component, Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageComponent } from './message.component';
import { FORM_FIELD_ID } from '../form-field/form-field-id.token';

@Component({
  template: `<span bursitMessage>Enter your email address</span>`,
  standalone: false,
})
class DefaultHostComponent {}

@Component({
  template: `<span bursitMessage id="custom-id">Enter your email address</span>`,
  standalone: false,
})
class CustomIdHostComponent {}

function createTestFixture<T>(
  component: Type<T>,
  fieldId?: string,
): ComponentFixture<T> {
  const providers =
    fieldId !== undefined ? [{ provide: FORM_FIELD_ID, useValue: fieldId }] : [];

  const fixture = TestBed.configureTestingModule({
    declarations: [component],
    imports: [MessageComponent],
    providers,
  }).createComponent(component);
  fixture.detectChanges();
  return fixture;
}

describe('MessageComponent', () => {
  it('should instantiate when the host uses the bursitMessage attribute', () => {
    const fixture = createTestFixture(DefaultHostComponent);
    const debugElement = fixture.debugElement.query(By.directive(MessageComponent));

    expect(debugElement).toBeTruthy();
    expect(debugElement.componentInstance).toBeInstanceOf(MessageComponent);
    fixture.destroy();
  });

  it('should apply the bursit-message host class', () => {
    const fixture = createTestFixture(DefaultHostComponent);
    const message: HTMLElement = fixture.nativeElement.querySelector('[bursitMessage]');

    expect(message.classList).toContain('bursit-message');
    fixture.destroy();
  });

  it('should derive the id from FORM_FIELD_ID when the author did not set one', () => {
    const fixture = createTestFixture(DefaultHostComponent, 'bursit-field-1');
    const message: HTMLElement = fixture.nativeElement.querySelector('[bursitMessage]');

    expect(message.getAttribute('id')).toBe('bursit-field-1-message');
    fixture.destroy();
  });

  it('should preserve an author-provided id', () => {
    const fixture = createTestFixture(CustomIdHostComponent, 'bursit-field-1');
    const message: HTMLElement = fixture.nativeElement.querySelector('[bursitMessage]');

    expect(message.getAttribute('id')).toBe('custom-id');
    fixture.destroy();
  });

  it('should not set an id when FORM_FIELD_ID is not provided', () => {
    const fixture = createTestFixture(DefaultHostComponent);
    const message: HTMLElement = fixture.nativeElement.querySelector('[bursitMessage]');

    expect(message.getAttribute('id')).toBeNull();
    fixture.destroy();
  });
});
