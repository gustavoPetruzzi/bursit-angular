import { Component, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'bursit-checkbox',
  imports: [],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Checkbox),
      multi: true
    }
  ],
})
export class Checkbox implements ControlValueAccessor {

  checked = model(false);
  indeterminate = input(false);
  required = input(false);
  disabled = model(false);
  validationInteraction = input<'default' | 'touched'>('default');
  readonly focused = signal(false);
  private onChange?: (value: boolean) => void;
  private onTouched?: () => void;

  writeValue(val: boolean): void {
    this.checked.set(val);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;  
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  handleChange(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.checked.set(value);
    this.onChange?.(value)
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onFocus() {
    this.focused.set(true);
  }

  onBlur() {
    this.focused.set(false);
    this.onTouched?.();
  }
}
