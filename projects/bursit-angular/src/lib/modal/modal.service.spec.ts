import { Component, Injector, Injectable, Inject, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Overlay, OverlayModule } from '@angular/cdk/overlay';
import { Observable } from 'rxjs';

import { ModalService } from './modal.service';
import { ModalRef } from './modal-ref';
import { MODAL_DATA, MODAL_REF, ModalSize } from './modal.config';

// --- Test helpers ---

/** Dummy content component injected by ModalService */
@Component({
  template: '<p>modal content works</p>',
})
class TestContentComponent {}

/** Content component that captures MODAL_DATA */
@Component({
  template: '<p>{{ data?.message }}</p>',
})
class DataAwareContentComponent {
  constructor(@Inject(MODAL_DATA) public data: { message: string } | null) {}
}

/** Content component that injects MODAL_REF */
@Component({
  template: '<button (click)="ref.close()">Close</button>',
})
class RefAwareContentComponent {
  ref = inject<ModalRef<RefAwareContentComponent>>(MODAL_REF);
}

function setup(): { service: ModalService } {
  TestBed.configureTestingModule({
    imports: [OverlayModule],
    providers: [ModalService],
  });
  return { service: TestBed.inject(ModalService) };
}

// --- Tests ---

describe('ModalService', () => {
  it('should be created', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
  });

  describe('open', () => {
    it('should return a ModalRef', () => {
      const { service } = setup();
      const ref = service.open(TestContentComponent);

      expect(ref).toBeInstanceOf(ModalRef);
    });

    it('should return a ModalRef typed to the content component', () => {
      const { service } = setup();
      const ref: ModalRef<TestContentComponent> = service.open(TestContentComponent);

      expect(ref.componentInstance).toBeInstanceOf(TestContentComponent);
    });

    it('should pass config.data to content component via MODAL_DATA', () => {
      const { service } = setup();
      const ref = service.open(DataAwareContentComponent, {
        data: { message: 'hello' },
      });

      expect(ref.componentInstance.data).toEqual({ message: 'hello' });
    });

    it('should inject MODAL_REF into the content component', () => {
      const { service } = setup();
      const ref = service.open(RefAwareContentComponent);
      const results: (RefAwareContentComponent | undefined)[] = [];
      ref.afterClosed().subscribe((r) => results.push(r));

      // Access ModalRef from inside the content component and close
      ref.componentInstance.ref.close();

      expect(results).toEqual([undefined]);
    });

    // TODO(T-005): depends on ModalComponent rendering [role="dialog"]
    it.skip('should apply default size when not specified', () => {
      const { service } = setup();
      const ref = service.open(TestContentComponent);
      const modalElement = document.querySelector('[role="dialog"]');

      expect(modalElement?.classList).toContain(`bursit-size-${ModalSize.MEDIUM}`);
      ref.close();
    });

    // TODO(T-005): depends on ModalComponent rendering [role="dialog"]
    it.skip('should apply custom size class', () => {
      const { service } = setup();
      const ref = service.open(TestContentComponent, { size: ModalSize.LARGE });
      const modalElement = document.querySelector('[role="dialog"]');

      expect(modalElement?.classList).toContain(`bursit-size-${ModalSize.LARGE}`);
      ref.close();
    });
  });

  describe('backdrop', () => {
    it('should not close modal on backdrop click when backdropClosable is false', () => {
      const { service } = setup();
      const ref = service.open(TestContentComponent, { backdropClosable: false });
      const results: (TestContentComponent | undefined)[] = [];
      ref.afterClosed().subscribe((r) => results.push(r));

      // Click backdrop
      const backdrop = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop?.click();

      expect(results).toEqual([]);
      ref.close();
    });

    it('should close modal on backdrop click when backdropClosable is true', () => {
      const { service } = setup();
      const ref = service.open(TestContentComponent, { backdropClosable: true });
      const results: (TestContentComponent | undefined)[] = [];
      ref.afterClosed().subscribe((r) => results.push(r));

      const backdrop = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop?.click();

      expect(results).toEqual([undefined]);
    });
  });

  describe('closeAll', () => {
    it('should close all open modals', () => {
      const { service } = setup();
      const results1: (TestContentComponent | undefined)[] = [];
      const results2: (TestContentComponent | undefined)[] = [];

      const ref1 = service.open(TestContentComponent);
      const ref2 = service.open(TestContentComponent);

      ref1.afterClosed().subscribe((r) => results1.push(r));
      ref2.afterClosed().subscribe((r) => results2.push(r));

      service.closeAll();

      expect(results1).toEqual([undefined]);
      expect(results2).toEqual([undefined]);
    });
  });
});
