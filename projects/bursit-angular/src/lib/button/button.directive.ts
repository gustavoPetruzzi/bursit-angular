import { Directive, input } from '@angular/core';
import { ButtonColor } from './models/button-color.type';

@Directive({
  selector: '[bursit-button], [bursitButton]',
  host: {
    class: 'bursit-button',
    '[class.bursit-button-primary]': 'color() === "primary"',
    '[class.bursit-button-secondary]': 'color() === "secondary"',
    '[class.bursit-button-outline]': 'color() === "outline"',
    '[class.bursit-button-link]': 'color() === "link"',
    '[class.bursit-button-danger]': 'color() === "danger"',
  },
})
export class ButtonDirective {
  color = input<ButtonColor>('primary');
}
