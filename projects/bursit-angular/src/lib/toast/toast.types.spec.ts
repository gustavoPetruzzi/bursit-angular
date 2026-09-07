import { ToastType, ToastPosition, ToastOptions, TOAST_DEFAULTS } from './toast.types';

describe('toast.types', () => {
  describe('TOAST_DEFAULTS', () => {
    it('should default to success type', () => {
      expect(TOAST_DEFAULTS.type).toBe('success');
    });

    it('should default to 5000ms duration', () => {
      expect(TOAST_DEFAULTS.duration).toBe(5000);
    });

    it('should default to bottom-right position', () => {
      expect(TOAST_DEFAULTS.position).toBe('bottom-right');
    });

    it('should show the close button by default', () => {
      expect(TOAST_DEFAULTS.showCloseButton).toBe(true);
    });

    it('should not have an onClose callback by default', () => {
      expect(TOAST_DEFAULTS.onClose).toBeUndefined();
    });
  });

  describe('type unions', () => {
    it('should accept every ToastType value', () => {
      const types: ToastType[] = ['success', 'error', 'info', 'warning'];
      expect(types).toHaveLength(4);
      types.forEach((t) => expect(['success', 'error', 'info', 'warning']).toContain(t));
    });

    it('should accept every ToastPosition value', () => {
      const positions: ToastPosition[] = [
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left',
        'top-center',
        'bottom-center',
      ];
      expect(positions).toHaveLength(6);
    });
  });

  describe('ToastOptions', () => {
    it('should require a message', () => {
      const opts: ToastOptions = { message: 'Saved!' };
      expect(opts.message).toBe('Saved!');
    });

    it('should allow all optional fields to be omitted', () => {
      const opts: ToastOptions = { message: 'Hi' };
      expect(opts.type).toBeUndefined();
      expect(opts.duration).toBeUndefined();
      expect(opts.position).toBeUndefined();
      expect(opts.showCloseButton).toBeUndefined();
      expect(opts.onClose).toBeUndefined();
    });

    it('should allow every field to be specified', () => {
      const onClose = jest.fn();
      const opts: ToastOptions = {
        type: 'error',
        message: 'Something failed',
        duration: 8000,
        position: 'top-left',
        showCloseButton: false,
        onClose,
      };
      expect(opts).toEqual({
        type: 'error',
        message: 'Something failed',
        duration: 8000,
        position: 'top-left',
        showCloseButton: false,
        onClose,
      });
    });
  });
});