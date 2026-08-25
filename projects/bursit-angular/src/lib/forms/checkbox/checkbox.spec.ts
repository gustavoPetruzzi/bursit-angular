import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Checkbox } from './checkbox';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component, signal } from '@angular/core';


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
