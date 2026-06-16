import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { A11yModule, CdkTrapFocus } from '@angular/cdk/a11y';

import { MODAL_CONFIG, ModalSize } from './modal.config';

/**
 * Chrome wrapper rendered inside the CDK Overlay.
 *
 * Responsabilities:
 * - role="dialog" + aria-modal="true" (REQ-MOD-006)
 * - Focus trap via cdkTrapFocus (REQ-MOD-006 scenario 1)
 * - Three named slots: header, body, footer (REQ-MOD-003)
 * - Size class via @Input() config.size (REQ-MOD-004)
 *
 * @see REQ-MOD-003 — Named slots
 * @see REQ-MOD-006 — WCAG 2.2 AA accessibility
 */
@Component({
  selector: 'bursit-modal',
  standalone: true,
  imports: [A11yModule],
  template: `
    <ng-content select="[bursitModalHeader]"></ng-content>
    <ng-content select="[bursitModalBody]"></ng-content>
    <ng-content select="[bursitModalFooter]"></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'dialog',
    'aria-modal': 'true',
    '[class.bursit-size-small]': 'this.config.size === sizes.SMALL',
    '[class.bursit-size-medium]': 'this.config.size === sizes.MEDIUM',
    '[class.bursit-size-large]': 'this.config.size === sizes.LARGE',
    '[class.bursit-size-fullscreen]': 'this.config.size === sizes.FULLSCREEN'
  },
  hostDirectives: [CdkTrapFocus]

})
export class ModalComponent {
  readonly config = inject(MODAL_CONFIG);
  protected readonly sizes = ModalSize;
}
