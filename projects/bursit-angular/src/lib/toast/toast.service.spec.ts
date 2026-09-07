import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ToastService } from './toast.service';
import { ToastRef } from './toast-ref';
import { TOAST_DEFAULTS } from './toast.types';

@Component({
  template: '',
  standalone: true,
})
class TestHostComponent {}

describe('ToastService', () => {
  let service: ToastService;
  let fixture: ComponentFixture<TestHostComponent>;
  let overlayContainer: OverlayContainer | null = null;

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({ imports: [TestHostComponent] });
    service = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.useRealTimers();
    overlayContainer?.ngOnDestroy();
    overlayContainer = null;
    document.body.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('should be provided in root', () => {
    expect(TestBed.inject(ToastService)).toBe(service);
  });

  it('should create a toast and return a ref', () => {
    const ref = service.show({ message: 'Hello' });
    expect(ref).toBeInstanceOf(ToastRef);
    expect(ref.message).toBe('Hello');
  });

  it('should apply defaults to shown toasts', () => {
    const ref = service.show({ message: 'Hello' });
    expect(ref.options.type).toBe(TOAST_DEFAULTS.type);
    expect(ref.options.duration).toBe(TOAST_DEFAULTS.duration);
    expect(ref.options.position).toBe(TOAST_DEFAULTS.position);
    expect(ref.options.showCloseButton).toBe(TOAST_DEFAULTS.showCloseButton);
  });

  it('should merge provided options over defaults', () => {
    const ref = service.show({
      message: 'Err',
      type: 'error',
      duration: 8000,
      position: 'top-left',
    });
    expect(ref.options.type).toBe('error');
    expect(ref.options.duration).toBe(8000);
    expect(ref.options.position).toBe('top-left');
  });

  it('should default type to success when no type is provided', () => {
    const ref = service.show({ message: 'Hello' });
    expect(ref.options.type).toBe('success');
  });

  describe('convenience methods', () => {
    it.each([
      ['success', 'success'],
      ['error', 'error'],
      ['warning', 'warning'],
      ['info', 'info'],
    ])('%s() should create a %s toast', (method, type) => {
      const ref = service[method as 'success' | 'error' | 'warning' | 'info'](
        'A message',
      );
      expect(ref.options.type).toBe(type);
    });

    it('success() should merge extra options', () => {
      const ref = service.success('Saved', { position: 'top-left', duration: 7000 });
      expect(ref.options.type).toBe('success');
      expect(ref.options.position).toBe('top-left');
      expect(ref.options.duration).toBe(7000);
    });

    it('error() should use a longer duration by default', () => {
      const ref = service.error('Boom');
      expect(ref.options.type).toBe('error');
    });
  });

  describe('auto-dismiss timer', () => {
    it('should auto-dismiss after the configured duration', () => {
      const ref = service.show({ message: 'Hi', duration: 1000 });
      const spy = jest.fn();
      ref.afterClosed().subscribe(spy);

      jest.advanceTimersByTime(999);
      expect(ref.closed).toBe(false);

      jest.advanceTimersByTime(1);
      expect(ref.closed).toBe(true);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not auto-dismiss when duration is 0', () => {
      const ref = service.show({ message: 'Hi', duration: 0 });
      jest.advanceTimersByTime(60000);
      expect(ref.closed).toBe(false);
      service.closeAll();
    });

    it('should call onClose when auto-dismissed', () => {
      const onClose = jest.fn();
      service.show({ message: 'Hi', duration: 100, onClose });
      jest.advanceTimersByTime(101);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should cancel auto-dismiss when dismissed manually', () => {
      const ref = service.show({ message: 'Hi', duration: 1000 });
      const spy = jest.fn();
      ref.afterClosed().subscribe(spy);

      ref.dismiss();
      jest.advanceTimersByTime(5000);

      expect(spy).toHaveBeenCalledTimes(1); // only the manual dismiss
      expect(ref.closed).toBe(true);
    });
  });

  describe('closeAll', () => {
    it('should dismiss every open toast', () => {
      const a = service.show({ message: 'A', duration: 5000 });
      const b = service.show({ message: 'B', duration: 0 });
      const c = service.show({ message: 'C', duration: 5000 });

      service.closeAll();

      expect(a.closed).toBe(true);
      expect(b.closed).toBe(true);
      expect(c.closed).toBe(true);
    });
  });

  describe('DOM rendering', () => {
    it('should render the toast message in a CDK overlay', () => {
      overlayContainer = TestBed.inject(OverlayContainer);
      service.show({ message: 'Hello overlay', duration: 0 });
      jest.advanceTimersByTime(0);

      expect(document.querySelector('.cdk-overlay-container')).toBeTruthy();
      expect(document.body.textContent).toContain('Hello overlay');
    });

    it('should remove the toast from the DOM after auto-dismiss', () => {
      overlayContainer = TestBed.inject(OverlayContainer);
      service.show({ message: 'Bye', duration: 10 });
      jest.advanceTimersByTime(0);
      expect(document.body.textContent).toContain('Bye');

      jest.advanceTimersByTime(50);

      expect(document.body.textContent).not.toContain('Bye');
    });

    it('should remove the toast from the DOM on manual dismiss', () => {
      overlayContainer = TestBed.inject(OverlayContainer);
      const ref = service.show({ message: 'Bye manual', duration: 0 });
      jest.advanceTimersByTime(0);
      expect(document.body.textContent).toContain('Bye manual');

      ref.dismiss();
      jest.advanceTimersByTime(0);

      expect(document.body.textContent).not.toContain('Bye manual');
    });
  });

  describe('stacking by position', () => {
    it('should stack multiple toasts in a single overlay', () => {
      overlayContainer = TestBed.inject(OverlayContainer);
      service.show({ message: 'A', duration: 0 });
      service.show({ message: 'B', duration: 0 });
      jest.advanceTimersByTime(0);

      expect(document.body.textContent).toContain('A');
      expect(document.body.textContent).toContain('B');
      expect(document.querySelectorAll('.cdk-overlay-pane').length).toBe(1);
      expect(document.querySelectorAll('bursit-toast-item').length).toBe(2);
    });

    it('should use separate overlays for different positions', () => {
      overlayContainer = TestBed.inject(OverlayContainer);
      service.show({ message: 'Left', duration: 0, position: 'top-left' });
      service.show({ message: 'Right', duration: 0 });
      jest.advanceTimersByTime(0);

      expect(document.querySelectorAll('.cdk-overlay-pane').length).toBe(2);
    });

    it('should dispose the overlay when the last toast of a position closes', () => {
      overlayContainer = TestBed.inject(OverlayContainer);
      const ref = service.show({ message: 'Solo', duration: 0 });
      jest.advanceTimersByTime(0);
      expect(document.querySelectorAll('.cdk-overlay-pane').length).toBe(1);

      ref.dismiss();
      jest.advanceTimersByTime(0);

      expect(document.querySelectorAll('.cdk-overlay-pane').length).toBe(0);
    });
  });

  describe('position strategy', () => {
    it('should render at the default bottom-right position', () => {
      overlayContainer = TestBed.inject(OverlayContainer);
      service.show({ message: 'Hi', duration: 0 });
      jest.advanceTimersByTime(0);
      const wrapper = document.querySelector('.cdk-global-overlay-wrapper') as HTMLElement;
      expect(wrapper).toBeTruthy();
      expect(wrapper.style.justifyContent).toBe('flex-end');
      expect(wrapper.style.alignItems).toBe('flex-end');
    });

    it('should honor a custom position option', () => {
      overlayContainer = TestBed.inject(OverlayContainer);
      service.show({ message: 'Hi', duration: 0, position: 'top-left' });
      jest.advanceTimersByTime(0);
      const wrapper = document.querySelector('.cdk-global-overlay-wrapper') as HTMLElement;
      expect(wrapper.style.justifyContent).toBe('flex-start');
      expect(wrapper.style.alignItems).toBe('flex-start');
    });
  });
});