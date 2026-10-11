import { contentChild, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormFieldControl } from './form-field-control.directive';
import { LabelDirective } from '../label/label.directive';
import { ErrorComponent } from '../error/error.component';
import { MessageComponent } from '../message/message.component';
import { FormFieldTypes } from './form-field-types.enum';
import { createFieldId, FORM_FIELD_ID } from './form-field-id.token';

@Component({
  selector: 'bursit-form-field',
  providers: [
    { provide: FORM_FIELD_ID, useFactory: createFieldId }
  ],
  imports: [],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
  host: {
    '[class.bursit-form-field]': 'true',
    '[class.bursit-form-field-disabled]': 'formFieldControl()?.disabled()',
    '[class.bursit-focus]': 'formFieldControl()?.focused()',
    '[class.bursit-placeholder]': 'formFieldControl()?.hasPlaceholder',
    '[class.bursit-hover]': 'formFieldControl()?.hovered()',
    '[class.bursit-form-field-error]': 'formFieldControl()?.invalid()',
    '[class.bursit-form-field-floating-label]': 'formFieldControl()?.floatingLabel?.()',
    '[class.bursit-form-field-type-select]': 'formFieldControl()?.type === formFieldTypes.SELECT',
    '[class.bursit-form-field-required]': 'formFieldControl()?.required()',
    '[class.bursit-form-field-has-value]':
      'formFieldControl()?.hasValue?.() ?? !!formFieldControl()?.control?.value',
    '[class.bursit-form-field-no-label]': '!label()',
    '[attr.role]': '"group"'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormField {
  formFieldControl = contentChild(FormFieldControl, { read: FormFieldControl, descendants: true });
  label = contentChild(LabelDirective, { read: LabelDirective });
  // Whether the consumer DECLARED the slots, not whether they are rendered:
  // `contentChild` matches declared content, so these stay stable while the
  // error slot's `@if` on validity toggles the DOM. `resolveDescribedBy` combines
  // `hasError` with the control's validity to mirror that `@if`.
  hasError = contentChild(ErrorComponent);
  hasMessage = contentChild(MessageComponent);

  formFieldTypes = FormFieldTypes;
  readonly fieldId = inject(FORM_FIELD_ID);

  constructor() {}
}
