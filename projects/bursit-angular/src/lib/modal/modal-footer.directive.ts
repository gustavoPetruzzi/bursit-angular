import { Directive } from '@angular/core';

/**
 * Marks an element as the modal footer slot.
 * 100% free projection — no default buttons or actions (REQ-MOD-003).
 *
 * @see REQ-MOD-003 — Named slots (footer: free projection)
 */
@Directive({
  selector: '[bursitModalFooter]',
  standalone: true,
})
export class ModalFooterDirective {}
