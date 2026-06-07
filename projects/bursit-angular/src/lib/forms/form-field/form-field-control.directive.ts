import { Directive, InputSignal, signal } from '@angular/core';
import { FormFieldTypes } from './form-field-types.enum';

@Directive()
export abstract class FormFieldControl<T> {
  readonly stateChanges = signal(0);
  readonly type?: FormFieldTypes;
  disabled?: InputSignal<boolean>;
  focused?: boolean;
  hovered?: boolean;
  invalid?: boolean;
  clearable?: boolean;
  required?: InputSignal<boolean>;
  hasValue?: boolean;
  hasPlaceholder?: boolean;
  floatingLabel?: InputSignal<boolean>;
  //TODO Check that any
  control?: any;
}
