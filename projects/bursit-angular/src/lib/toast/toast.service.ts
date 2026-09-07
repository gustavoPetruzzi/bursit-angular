import { inject, Injectable, signal } from "@angular/core";
import { ToastRef } from "./toast-ref";
import { Overlay, OverlayRef, GlobalPositionStrategy } from "@angular/cdk/overlay";
import { ToastOptions, ToastPosition, TOAST_DEFAULTS } from "./toast.types";
import { ComponentPortal } from "@angular/cdk/portal";
import { ToastContainerComponent } from "./toast-container/toast-container";

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private _positions = new Map<ToastPosition, { overlayRef: OverlayRef; toasts: ToastRef[] }>();
  private readonly _state = signal<Record<ToastPosition, ToastRef[]>>({
    'top-left': [],
    'top-right': [],
    'bottom-left': [],
    'bottom-right': [],
    'top-center': [],
    'bottom-center': [],
  });
  private _overlay = inject(Overlay);

  toastsForPosition(position: ToastPosition): ToastRef[] {
    return this._state()[position];
  }

  show(options: ToastOptions): ToastRef {
    const toastRef = new ToastRef("", options);
    const position = (toastRef.options.position ?? TOAST_DEFAULTS.position) as ToastPosition;

    let state = this._positions.get(position);
    if (!state) {
      const overlayRef = this._overlay.create({
        positionStrategy: this._positionStrategy(position),
      });
      const portal = new ComponentPortal(ToastContainerComponent);
      const containerRef = overlayRef.attach(portal);
      containerRef.setInput('position', position);
      state = { overlayRef, toasts: [] };
      this._positions.set(position, state);
    }

    state.toasts.push(toastRef);
    this._state.update((s) => ({ ...s, [position]: [...state!.toasts] }));

    toastRef.afterClosed().subscribe(() => {
      this._removeToast(toastRef, position);
    });

    if (toastRef.options.duration && toastRef.options.duration > 0) {
      setTimeout(() => {
        toastRef.dismiss();
      }, toastRef.options.duration);
    }

    return toastRef;
  }


  success(message: string, options?: Partial<ToastOptions>) {
    return this.show({message, type: 'success', ...options});
  }

  error(message: string, options?: Partial<ToastOptions>) {
    return this.show({message, type: 'error', ...options});
  }

  info(message: string, options?: Partial<ToastOptions>) {
    return this.show({message, type: 'info', ...options});
  }

  warning(message: string, options?: Partial<ToastOptions>) {
    return this.show({message, type: 'warning', ...options});
  }

  closeAll() {
    this._positions.forEach((state) => {
      [...state.toasts].forEach((ref) => ref.dismiss());
    });
  }

  private _removeToast(toastRef: ToastRef, position: ToastPosition) {
    const state = this._positions.get(position);
    if (!state) return;

    const index = state.toasts.indexOf(toastRef);
    if (index >= 0) {
      state.toasts.splice(index, 1);
      this._state.update((s) => ({ ...s, [position]: [...state.toasts] }));
    }

    if (state.toasts.length === 0) {
      state.overlayRef.dispose();
      this._positions.delete(position);
    }
  }

  private _positionStrategy(position: ToastPosition): GlobalPositionStrategy {
    const global = this._overlay.position().global();
    switch (position) {
      case 'top-left': return global.top().left();
      case 'top-right': return global.top().right();
      case 'bottom-left': return global.bottom().left();
      case 'bottom-right': return global.bottom().right();
      case 'top-center': return global.top().centerHorizontally();
      case 'bottom-center': return global.bottom().centerHorizontally();
    }
  }
}
