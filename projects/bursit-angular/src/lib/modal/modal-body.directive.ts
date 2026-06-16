import { Directive } from '@angular/core';

/**
 * Marks an element as the modal body slot.
 * Scrolls internally when content exceeds viewport (REQ-MOD-003 scenario 4).
 *
 * @see REQ-MOD-003 — Named slots
 */
@Directive({
  selector: '[bursitModalBody]',
  standalone: true,
})
export class ModalBodyDirective {}
