import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ToastContainerComponent } from './toast-container';
import { ToastService } from '../toast.service';
import { ToastPosition } from '../toast.types';

describe('ToastContainerComponent', () => {
  let fixture: ComponentFixture<ToastContainerComponent>;
  let component: ToastContainerComponent;
  let service: ToastService;
  let overlayContainer: OverlayContainer | null = null;

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({ imports: [ToastContainerComponent] });
    service = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('position', 'bottom-right' as ToastPosition);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.useRealTimers();
    service.closeAll();
    overlayContainer?.ngOnDestroy();
    overlayContainer = null;
    document.body.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect the requested position input', () => {
    expect(component.position()).toBe('bottom-right');
  });

  it('should expose an empty toast list when the position has no toasts', () => {
    expect(component.toasts()).toEqual([]);
    expect(
      fixture.nativeElement.querySelectorAll('bursit-toast-item').length,
    ).toBe(0);
  });

  it('should render a toast item for each toast shown at its own position', () => {
    service.show({ message: 'Saved for real', duration: 0 });
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('bursit-toast-item');
    expect(items.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Saved for real');
  });

  it('should render multiple toasts for its position, stacked in order', () => {
    service.show({ message: 'First', duration: 0 });
    service.show({ message: 'Second', duration: 0 });
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('bursit-toast-item');
    expect(items.length).toBe(2);
    const text = fixture.nativeElement.textContent as string;
    expect(text.indexOf('First')).toBeLessThan(text.indexOf('Second'));
  });

  it('should not render toasts that target a different position', () => {
    service.show({ message: 'Left one', duration: 0, position: 'top-left' });
    service.show({ message: 'Right one', duration: 0 });
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('bursit-toast-item');
    expect(items.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Right one');
    expect(fixture.nativeElement.textContent).not.toContain('Left one');
  });

  it('should re-render when the position input changes', () => {
    service.show({ message: 'Targeted', duration: 0, position: 'top-left' });
    fixture.componentRef.setInput('position', 'top-left' as ToastPosition);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('bursit-toast-item');
    expect(items.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Targeted');
  });

  it('should pause the toast timer when its item is hovered', () => {
    const ref = service.show({ message: 'Hover me', duration: 1000 });
    fixture.detectChanges();

    const item = fixture.nativeElement.querySelector(
      'bursit-toast-item',
    ) as HTMLElement;
    item.dispatchEvent(new MouseEvent('mouseenter'));

    // Timer paused: advancing far past the duration must not dismiss it.
    jest.advanceTimersByTime(3000);
    expect(ref.closed).toBe(false);
  });

  it('should resume the toast timer when the item hover ends', () => {
    const ref = service.show({ message: 'Resume me', duration: 1000 });
    fixture.detectChanges();

    const item = fixture.nativeElement.querySelector(
      'bursit-toast-item',
    ) as HTMLElement;
    // Pause immediately (no elapsed time), leaving the full 1000ms remaining,
    // then resume at t=300 so dismissal occurs at t=1300.
    item.dispatchEvent(new MouseEvent('mouseenter'));
    jest.advanceTimersByTime(300);
    item.dispatchEvent(new MouseEvent('mouseleave'));

    jest.advanceTimersByTime(999);
    expect(ref.closed).toBe(false);
    jest.advanceTimersByTime(1);
    expect(ref.closed).toBe(true);
  });
});
