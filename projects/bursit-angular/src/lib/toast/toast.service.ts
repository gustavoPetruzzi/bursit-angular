import { inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { ToastRef } from "./toast-ref";
import { Overlay, OverlayRef, GlobalPositionStrategy } from "@angular/cdk/overlay";
import { ToastOptions, ToastPosition, TOAST_DEFAULTS } from "./toast.types";
import { ComponentPortal } from "@angular/cdk/portal";
import { ToastContainerComponent } from "./toast-container/toast-container";

interface TimerState {
  timerId: ReturnType<typeof setTimeout>;
  remaining: number;
  start: number | null;
}

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
  private readonly _timers = new Map<ToastRef, TimerState>();
  private _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private _overlay = inject(Overlay);

  toastsForPosition(position: ToastPosition): ToastRef[] {
    return this._state()[position];
  }

  show(options: ToastOptions): ToastRef {
    const toastRef = new ToastRef("", options);
    const position = (toastRef.options.position ?? TOAST_DEFAULTS.position) as ToastPosition;

    if (!this._isBrowser) {
      // SSR guard: no DOM access. Return a ref that reports closure without an overlay.
      toastRef.afterClosed().subscribe(() => {});
      return toastRef;
    }

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

    const maxVisible = toastRef.options.maxVisible ?? TOAST_DEFAULTS.maxVisible ?? 5;
    if (state.toasts.length > maxVisible) {
      const oldest = state.toasts[0];
      oldest.dismiss();
    }

    if (toastRef.options.duration && toastRef.options.duration > 0) {
      this._startTimer(toastRef);
    }

    return toastRef;
  }

  pauseToast(toastRef: ToastRef) {
    const timer = this._timers.get(toastRef);
    if (!timer || timer.start === null) return;
    const elapsed = Date.now() - timer.start;
    timer.remaining -= elapsed;
    clearTimeout(timer.timerId);
    timer.start = null;
  }

  resumeToast(toastRef: ToastRef) {
    const timer = this._timers.get(toastRef);
    if (!timer || timer.start !== null) return;
    if (timer.remaining <= 0) {
      toastRef.dismiss();
      return;
    }
    timer.start = Date.now();
    timer.timerId = setTimeout(() => toastRef.dismiss(), timer.remaining);
  }

  private _startTimer(toastRef: ToastRef) {
    const duration = toastRef.options.duration ?? TOAST_DEFAULTS.duration ?? 5000;
    const timer: TimerState = {
      timerId: undefined as unknown as ReturnType<typeof setTimeout>,
      remaining: duration,
      start: Date.now(),
    };
    timer.timerId = setTimeout(() => toastRef.dismiss(), duration);
    this._timers.set(toastRef, timer);
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
    this._clearTimer(toastRef);
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

  private _clearTimer(toastRef: ToastRef) {
    const timer = this._timers.get(toastRef);
    if (!timer) return;
    clearTimeout(timer.timerId);
    this._timers.delete(toastRef);
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
