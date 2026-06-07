import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonDirective } from './button.directive';

describe('ButtonDirective', () => {
  it('should create an instance', () => {
    const fixture = createTestFixture('primary');
    const directive = fixture.debugElement.children[0].injector.get(ButtonDirective);
    expect(directive).toBeTruthy();
    fixture.destroy();
  });

  it('should apply base class bursit-button', () => {
    const fixture = createTestFixture('primary');
    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('bursit-button');
    fixture.destroy();
  });

  it('should apply bursit-button-primary class when color is primary', () => {
    const fixture = createTestFixture('primary');
    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('bursit-button-primary');
    fixture.destroy();
  });

  it('should apply bursit-button-secondary class when color is secondary', () => {
    const fixture = createTestFixture('secondary');
    fixture.detectChanges();
    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('bursit-button-secondary');
    fixture.destroy();
  });

  it('should apply bursit-button-outline class when color is outline', () => {
    const fixture = createTestFixture('outline');
    fixture.detectChanges();
    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('bursit-button-outline');
    fixture.destroy();
  });

  it('should apply bursit-button-link class when color is link', () => {
    const fixture = createTestFixture('link');
    fixture.detectChanges();
    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('bursit-button-link');
    fixture.destroy();
  });

  it('should apply bursit-button-danger class when color is danger', () => {
    const fixture = createTestFixture('danger');
    fixture.detectChanges();
    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('bursit-button-danger');
    fixture.destroy();
  });

  it('should not apply other color classes when set to primary', () => {
    const fixture = createTestFixture('primary');
    fixture.detectChanges();
    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.classList).not.toContain('bursit-button-secondary');
    expect(button.classList).not.toContain('bursit-button-outline');
    expect(button.classList).not.toContain('bursit-button-link');
    expect(button.classList).not.toContain('bursit-button-danger');
    fixture.destroy();
  });
});

type ButtonColor = 'primary' | 'secondary' | 'outline' | 'link' | 'danger';

@Component({
  template: `<button bursitButton [color]="color">Test</button>`,
  standalone: false,
})
class TestComponent {
  color: ButtonColor = 'primary';
}

function createTestFixture(color: ButtonColor): ComponentFixture<TestComponent> {
  const fixture = TestBed.configureTestingModule({
    declarations: [TestComponent],
    imports: [ButtonDirective],
  }).createComponent(TestComponent);
  fixture.componentInstance.color = color;
  fixture.detectChanges();
  return fixture;
}
