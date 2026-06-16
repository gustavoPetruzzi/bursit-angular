import { Injectable, Injector, Type } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { filter } from 'rxjs';

import { ModalRef } from './modal-ref';
import { MODAL_CONFIG, MODAL_DATA, ModalConfig, MODAL_DEFAULTS } from './modal.config';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly _activeModals = new Map<OverlayRef, ModalRef<any>>();

  constructor(
    private readonly _overlay: Overlay,
    private readonly _injector: Injector,
  ) {}

  open<T>(component: Type<T>, config?: ModalConfig): ModalRef<T> {
    const injector = Injector.create({
      providers: [
        { provide: MODAL_DATA, useValue: config?.data },
        { provide: MODAL_CONFIG, useValue: {...MODAL_DEFAULTS, ...config}}
      ],
      parent: this._injector,
    });

    const overlayRef = this._overlay.create({
      hasBackdrop: config?.hasBackdrop ?? true,
      positionStrategy: this._overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this._overlay.scrollStrategies.block(),
    });

    const modalRef = new ModalRef<T>();
    const portal = new ComponentPortal(component, null, injector);
    const componentRef = overlayRef.attach(portal);

    modalRef.componentInstance = componentRef.instance;

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
      overlayRef.backdropClick().subscribe(() => {
        modalRef.dismiss();
      });
    }

    // Clean up overlay when modal closes
    modalRef.afterClosed().subscribe(() => {
      overlayRef.dispose();
      this._activeModals.delete(overlayRef);
    });

    this._activeModals.set(overlayRef, modalRef);

    return modalRef;
  }

  closeAll(): void {
    this._activeModals.forEach((ref) => ref.dismiss());
  }
}
