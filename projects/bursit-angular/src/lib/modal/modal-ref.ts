import { Observable, Subject } from 'rxjs';

export class ModalRef<T = unknown> {
  componentInstance!: T;

  private readonly _afterClosed$ = new Subject<T | undefined>();
  private readonly _backdropClick$ = new Subject<MouseEvent>();
  private _closed = false;

  close(result?: T): void {
    if (this._closed) return;
    this._closed = true;
    this._afterClosed$.next(result);
    this._afterClosed$.complete();
  }

  dismiss(): void {
    if (this._closed) return;
    this._closed = true;
    this._afterClosed$.next(undefined);
    this._afterClosed$.complete();
  }

  afterClosed(): Observable<T | undefined> {
    return this._afterClosed$.asObservable();
  }

  backdropClick(): Observable<MouseEvent> {
    return this._backdropClick$.asObservable();
  }
}
