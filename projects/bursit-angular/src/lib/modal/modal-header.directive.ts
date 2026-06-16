import { Directive } from '@angular/core';

/**
 * Marks an element as the modal header slot.
 * Projected into `<bursit-modal>` via `<ng-content select="[bursitModalHeader]">`.
 *
 * @see REQ-MOD-003 — Named slots
 */
@Directive({
  selector: '[bursitModalHeader]',
  standalone: true,
})
export class ModalHeaderDirective {}
