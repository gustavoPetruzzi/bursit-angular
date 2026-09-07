export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastOptions {
  type?: ToastType;
  message: string;
  duration?: number; // in milliseconds
  position?: ToastPosition;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const TOAST_DEFAULTS: ToastOptions = {
  type: 'success',
  duration: 5000,
  position: 'bottom-right',
  showCloseButton: true,
  onClose: undefined,
  message: ''
}
