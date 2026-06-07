import { Directive } from '@angular/core';

@Directive({
  selector: '[bursit-label], [bursitLabel]',
  host: { class: 'bursit-label' },
})
export class LabelDirective {}
