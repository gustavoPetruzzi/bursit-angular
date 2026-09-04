import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { TooltipDirective } from './tooltip.directive';

describe('TooltipDirective', () => {
  let overlayContainer: OverlayContainer | null = null;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    overlayContainer?.ngOnDestroy();
    overlayContainer = null;
    document.body.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('should create an instance', () => {
    const fixture = createFixture();
    expect(directiveOf(fixture)).toBeTruthy();
    fixture.destroy();
  });

  it('should expose the content input through the bursitTooltip alias', () => {
    const fixture = createFixture();
    expect(directiveOf(fixture).content()).toBe('Save changes');
    fixture.destroy();
  });

  it('should render the tooltip after the show delay on mouseenter', () => {
    const fixture = createFixture();
    const directive = directiveOf(fixture);
    overlayContainer = TestBed.inject(OverlayContainer);
    const shown = jest.fn();
    directive.shown.subscribe(shown);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLElement;
    button.dispatchEvent(new Event('mouseenter'));
    expect(document.querySelector('[role="tooltip"]')).toBeNull();

    jest.advanceTimersByTime(directive.showDelay() + 1);

    const tooltip = document.querySelector('[role="tooltip"]');
    expect(tooltip).toBeTruthy();
    expect(tooltip?.textContent?.trim()).toBe('Save changes');
    expect(button.getAttribute('aria-describedby')).toMatch(/^bursit-tooltip-\d+$/);
    expect(document.getElementById(button.getAttribute('aria-describedby') as string)).toBe(tooltip);
    expect(shown).toHaveBeenCalledTimes(1);
    fixture.destroy();
  });

  it('should hide the tooltip after the hide delay on mouseleave', () => {
    const fixture = createFixture();
    const directive = directiveOf(fixture);
    overlayContainer = TestBed.inject(OverlayContainer);
    const hidden = jest.fn();
    directive.hidden.subscribe(hidden);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLElement;
    button.dispatchEvent(new Event('mouseenter'));
    jest.advanceTimersByTime(directive.showDelay() + 1);
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();

    button.dispatchEvent(new Event('mouseleave'));
    jest.advanceTimersByTime(directive.hideDelay() + 1);

    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(button.getAttribute('aria-describedby')).toBeNull();
    expect(hidden).toHaveBeenCalledTimes(1);
    fixture.destroy();
  });

  it('should not render the tooltip when disabled', () => {
    const fixture = createFixture({ disabled: true });
    const directive = directiveOf(fixture);
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLElement;
    button.dispatchEvent(new Event('mouseenter'));
    jest.advanceTimersByTime(directive.showDelay() + 1000);

    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(button.getAttribute('aria-describedby')).toBeNull();
    fixture.destroy();
  });

  it('should not render the tooltip when there is no content', () => {
    const fixture = createFixture({ content: null });
    const directive = directiveOf(fixture);
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLElement;
    button.dispatchEvent(new Event('mouseenter'));
    jest.advanceTimersByTime(directive.showDelay() + 1000);

    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    fixture.destroy();
  });

  it('should restore a pre-existing aria-describedby when the tooltip hides', () => {
    const fixture = createFixture();
    const directive = directiveOf(fixture);
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLElement;
    button.setAttribute('aria-describedby', 'my-original-description');
    button.dispatchEvent(new Event('mouseenter'));
    jest.advanceTimersByTime(directive.showDelay() + 1);
    expect(button.getAttribute('aria-describedby')).toContain('my-original-description');

    button.dispatchEvent(new Event('mouseleave'));
    jest.advanceTimersByTime(directive.hideDelay() + 1);

    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(button.getAttribute('aria-describedby')).toBe('my-original-description');
    fixture.destroy();
  });

  it('should cancel a pending hide and re-show when hovered again during the hide delay', () => {
    const fixture = createFixture();
    const directive = directiveOf(fixture);
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLElement;
    button.dispatchEvent(new Event('mouseenter'));
    jest.advanceTimersByTime(directive.showDelay() + 1);
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();

    // Leave then re-enter before the hide delay elapses
    button.dispatchEvent(new Event('mouseleave'));
    jest.advanceTimersByTime(directive.hideDelay() / 2);
    button.dispatchEvent(new Event('mouseenter'));
    jest.advanceTimersByTime(directive.hideDelay() + 1);

    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();
    fixture.destroy();
  });
});

@Component({
  template: `<button [bursitTooltip]="content" [disabled]="disabled">Hover me</button>`,
  imports: [TooltipDirective],
})
class HostComponent {
  content: string | null = 'Save changes';
  disabled = false;
}

function createFixture(overrides?: { disabled?: boolean; content?: string | null }) {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const fixture = TestBed.createComponent(HostComponent);
  if (overrides?.disabled) fixture.componentInstance.disabled = true;
  if (overrides && 'content' in overrides) fixture.componentInstance.content = overrides.content;
  fixture.detectChanges();
  return fixture as ComponentFixture<HostComponent>;
}

function directiveOf(fixture: ComponentFixture<HostComponent>): TooltipDirective {
  const found = fixture.debugElement.query(
    (d) => d.injector.get(TooltipDirective, null) !== null,
  );
  return found.injector.get(TooltipDirective);
}
