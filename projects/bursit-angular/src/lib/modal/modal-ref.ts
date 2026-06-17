import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';

const EXIT_ANIMATION_DURATION = 100;

export class ModalRef<T = unknown> {
  componentInstance!: T;

  private readonly _afterClosed$ = new Subject<T | undefined>();
  private readonly _backdropClick$ = new Subject<MouseEvent>();
  private _closed = false;
  private _hostElement: HTMLElement | null = null;
  private _overlayRef: OverlayRef | null = null;

  /** @internal Called by ModalService to wire up exit animation and overlay disposal. */
  _setupExit(hostElement: HTMLElement | null, overlayRef: OverlayRef): void {
    this._hostElement = hostElement;
    this._overlayRef = overlayRef;
  }

  /** @internal Called by ModalService when backdrop is clicked. */
  _emitBackdropClick(event: MouseEvent): void {
    this._backdropClick$.next(event);
  }

  close(result?: T): void {
    if (this._closed) return;
    this._closed = true;
    this._animateAndComplete(result);
  }

  dismiss(): void {
    if (this._closed) return;
    this._closed = true;
    this._animateAndComplete(undefined);
  }

  afterClosed(): Observable<T | undefined> {
    return this._afterClosed$.asObservable();
  }

  backdropClick(): Observable<MouseEvent> {
    return this._backdropClick$.asObservable();
  }

  private _animateAndComplete(result: T | undefined): void {
    const finish = () => {
      this._overlayRef?.dispose();
      this._afterClosed$.next(result);
      this._afterClosed$.complete();
    };

    if (this._hostElement) {
      this._hostElement.classList.add('bursit-modal-exit');
      setTimeout(finish, EXIT_ANIMATION_DURATION);
    } else {
      finish();
    }
  }
}
