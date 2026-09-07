import { TOAST_DEFAULTS } from './toast.types';
import { ToastRef } from './toast-ref';

describe('ToastRef', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  it('should store the message', () => {
    const ref = new ToastRef('msg-1', { message: 'Saved!' });
    expect(ref.message).toBe('Saved!');
  });

  it('should assign a unique id per instance', () => {
    const a = new ToastRef('', { message: 'A' });
    const b = new ToastRef('', { message: 'B' });
    expect(a.id).toBeTruthy();
    expect(b.id).toBeTruthy();
    expect(a.id).not.toBe(b.id);
  });

  it('should merge options with defaults', () => {
    const ref = new ToastRef('', { message: 'Hi' });
    expect(ref.options.type).toBe(TOAST_DEFAULTS.type);
    expect(ref.options.duration).toBe(TOAST_DEFAULTS.duration);
    expect(ref.options.position).toBe(TOAST_DEFAULTS.position);
    expect(ref.options.showCloseButton).toBe(TOAST_DEFAULTS.showCloseButton);
  });

  it('should keep explicitly provided options over defaults', () => {
    const ref = new ToastRef('', {
      message: 'Err',
      type: 'error',
      duration: 8000,
      position: 'top-left',
    });
    expect(ref.options.type).toBe('error');
    expect(ref.options.duration).toBe(8000);
    expect(ref.options.position).toBe('top-left');
  });

  it('should call onClose and emit afterClosed on dismiss', () => {
    const ref = new ToastRef('', { message: 'Hi', onClose });
    const spy = jest.fn();
    ref.afterClosed().subscribe(spy);

    ref.dismiss();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(ref.closed).toBe(true);
  });

  it('should not call onClose twice on repeated dismiss', () => {
    const ref = new ToastRef('', { message: 'Hi', onClose });
    ref.dismiss();
    ref.dismiss();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should complete afterClosed after dismissal', () => {
    const ref = new ToastRef('', { message: 'Hi' });
    const completeSpy = jest.fn();
    ref.afterClosed().subscribe({ complete: completeSpy });

    ref.dismiss();

    expect(completeSpy).toHaveBeenCalledTimes(1);
  });

  it('should expose dismissible from options', () => {
    const withClose = new ToastRef('', { message: 'A', showCloseButton: true });
    const withoutClose = new ToastRef('', { message: 'B', showCloseButton: false });
    expect(withClose.dismissible).toBe(true);
    expect(withoutClose.dismissible).toBe(false);
  });
});