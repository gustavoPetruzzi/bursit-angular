import { Directive, InputSignal, Signal } from '@angular/core';
import { FormFieldTypes } from './form-field-types.enum';

@Directive()
export abstract class FormFieldControl<T> {
  readonly type?: FormFieldTypes;
  focused?: Signal<boolean>;
  hovered?: Signal<boolean>;
  invalid?: Signal<boolean>;
  hasValue?: Signal<boolean>;
  disabled?: InputSignal<boolean>;
  clearable?: boolean;
  required?: InputSignal<boolean>;
  hasPlaceholder?: boolean;
  floatingLabel?: InputSignal<boolean>;
  //TODO Check that any
  control?: any;
}
