import { Injectable, Injector, Type } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { filter } from 'rxjs';

import { ModalRef } from './modal-ref';
import { MODAL_CONFIG, MODAL_DATA, MODAL_REF, ModalConfig, MODAL_DEFAULTS } from './modal.config';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly _activeModals = new Map<OverlayRef, ModalRef<any>>();

  constructor(
    private readonly _overlay: Overlay,
    private readonly _injector: Injector,
  ) {}

  open<T>(component: Type<T>, config?: ModalConfig): ModalRef<T> {
    const modalRef = new ModalRef<T>();
    const injector = Injector.create({
      providers: [
        { provide: MODAL_DATA, useValue: config?.data },
        { provide: MODAL_CONFIG, useValue: {...MODAL_DEFAULTS, ...config}},
        { provide: MODAL_REF, useValue: modalRef },
      ],
      parent: this._injector,
    });

    const overlayRef = this._overlay.create({
      hasBackdrop: config?.hasBackdrop ?? true,
      backdropClass: 'bursit-modal-overlay',
      positionStrategy: this._overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this._overlay.scrollStrategies.block(),
    });

    const portal = new ComponentPortal(component, null, injector);
    const componentRef = overlayRef.attach(portal);

    modalRef.componentInstance = componentRef.instance;

    // Wire exit animation — ModalRef handles the animate-out + dispose
    const hostElement = overlayRef.overlayElement.querySelector('bursit-modal') as HTMLElement | null;
    modalRef._setupExit(hostElement, overlayRef);

    // Handle ESC key
    if (config?.escClosable !== false) {
      overlayRef
        .keydownEvents()
        .pipe(filter((event) => event.key === 'Escape'))
        .subscribe(() => {
          modalRef.dismiss();
        });
    }

    // Handle backdrop click
    if (config?.backdropClosable !== false) {
      overlayRef.backdropClick().subscribe((event) => {
        modalRef._emitBackdropClick(event);
        modalRef.dismiss();
      });
    }

    // Clean up active modals map when modal closes (dispose is handled by ModalRef)
    modalRef.afterClosed().subscribe(() => {
      this._activeModals.delete(overlayRef);
    });

    this._activeModals.set(overlayRef, modalRef);

    return modalRef;
  }

  closeAll(): void {
    this._activeModals.forEach((ref) => ref.dismiss());
  }
}
