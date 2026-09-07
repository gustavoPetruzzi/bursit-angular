import { Subject } from "rxjs";
import { TOAST_DEFAULTS, ToastOptions } from "./toast.types";

export class ToastRef {
  public message: string;
  public closed = false;
  public dismissible;
  private readonly _afterClosed$ = new Subject<void>();
  
  constructor(public id: string, public options: ToastOptions) {
    this.id = id || Math.random().toString(36).substring(2, 15);
    this.options = { ...TOAST_DEFAULTS, ...options };
    this.message = this.options.message;
    this.dismissible = this.options.showCloseButton ?? true;
  }

  afterClosed() {
    return this._afterClosed$.asObservable();
  }

  dismiss() {
    if (this.closed) return;
    this.closed = true;
    this.options.onClose?.();
    this._afterClosed$.next();
    this._afterClosed$.complete();
  }
  
}