export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastOptions {
  type?: ToastType;
  message: string;
  duration?: number; // in milliseconds; 0 = manual dismiss only
  position?: ToastPosition;
  showCloseButton?: boolean;
  pauseOnHover?: boolean;
  maxVisible?: number;
  onClose?: () => void;
}

export const TOAST_DEFAULTS: ToastOptions = {
  type: 'success',
  duration: 5000,
  position: 'bottom-right',
  showCloseButton: true,
  pauseOnHover: true,
  maxVisible: 5,
  onClose: undefined,
  message: ''
}
