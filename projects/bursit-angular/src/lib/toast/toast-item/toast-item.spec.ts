import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastItemComponent } from './toast-item';
import { ToastType } from '../toast.types';

describe('ToastItemComponent', () => {
  let fixture: ComponentFixture<ToastItemComponent>;
  let component: ToastItemComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ToastItemComponent] });
    fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput('message', 'Hello toast');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('message', () => {
    it('should render the message text', () => {
      expect(fixture.nativeElement.textContent).toContain('Hello toast');
    });

    it('should update the rendered text when the message input changes', () => {
      fixture.componentRef.setInput('message', 'Updated message');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Updated message');
    });
  });

  describe('type', () => {
    it.each([
      ['success', 'bursit-toast--success'],
      ['info', 'bursit-toast--info'],
      ['warning', 'bursit-toast--warning'],
      ['error', 'bursit-toast--error'],
    ] as const)('should apply the %s host class', (type, expectedClass) => {
      fixture.componentRef.setInput('type', type);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain(expectedClass);
    });

    it('should default to the success type class', () => {
      expect(fixture.nativeElement.classList).toContain('bursit-toast--success');
    });
  });

  describe('ARIA', () => {
    it.each([
      ['success', 'status'],
      ['info', 'status'],
      ['warning', 'alert'],
      ['error', 'alert'],
    ] as const)('should expose role=%s for %s toasts', (type: ToastType, role: string) => {
      fixture.componentRef.setInput('type', type);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('role')).toBe(role);
    });
  });

  describe('close button', () => {
    it('should render a close button by default', () => {
      expect(fixture.nativeElement.querySelector('.bursit-toast__close')).toBeTruthy();
    });

    it('should give the close button an accessible label', () => {
      const button = fixture.nativeElement.querySelector(
        '.bursit-toast__close',
      ) as HTMLButtonElement;
      expect(button.getAttribute('aria-label')).toBe('Close notification');
    });

    it('should not render a close button when showCloseButton is false', () => {
      fixture.componentRef.setInput('showCloseButton', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.bursit-toast__close')).toBeNull();
    });

    it('should emit close when the close button is clicked', () => {
      const spy = jest.fn();
      component.close.subscribe(spy);

      const button = fixture.nativeElement.querySelector(
        '.bursit-toast__close',
      ) as HTMLButtonElement;
      button.click();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('hover events', () => {
    it('should emit pause on mouseenter', () => {
      const spy = jest.fn();
      component.pause.subscribe(spy);
      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit resume on mouseleave', () => {
      const spy = jest.fn();
      component.resume.subscribe(spy);
      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});