import { contentChild, ChangeDetectionStrategy, Component } from '@angular/core';
import { FormFieldControl } from './form-field-control.directive';
import { LabelDirective } from '../label/label.directive';
import { FormFieldTypes } from './form-field-types.enum';

@Component({
  selector: 'bursit-form-field',
  imports: [],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
  host: {
    '[class.bursit-form-field]': 'true',
    '[class.bursit-form-field-disabled]': 'formFieldControl()?.disabled()',
    '[class.bursit-focus]': 'formFieldControl()?.focused',
    '[class.bursit-placeholder]': 'formFieldControl()?.hasPlaceholder',
    '[class.bursit-hover]': 'formFieldControl()?.hovered',
    '[class.bursit-form-field-error]': 'formFieldControl()?.invalid',
    '[class.bursit-form-field-floating-label]': 'formFieldControl()?.floatingLabel()',
    '[class.bursit-form-field-required]': 'formFieldControl()?.required()',
    '[class.bursit-form-field-has-value]':
      'formFieldControl()?.hasValue ?? !!formFieldControl()?.control?.value',
    '[class.bursit-form-field-no-label]': '!label()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormField {
  formFieldControl = contentChild(FormFieldControl, { read: FormFieldControl, descendants: true });
  label = contentChild(LabelDirective, { read: LabelDirective });

  formFieldTypes = FormFieldTypes;

  constructor() {}
}
