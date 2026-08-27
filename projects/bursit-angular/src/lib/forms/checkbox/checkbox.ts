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
  host: {
    '[class.bursit-checkbox-checked]': "checked()",
    '[class.bursit-checkbox-indeterminate]': 'indeterminate()',
    '[class.bursit-checkbox-disabled]': 'disabled()',
    '[class.bursit-checkbox-focused]': 'focused()',
  }
})
export class Checkbox implements ControlValueAccessor {

  checked = model(false);
  indeterminate = model(false);
  required = input(false);
  disabled = model(false);
  validationInteraction = input<'default' | 'touched'>('default');
  readonly focused = signal(false);
  readonly hovered = signal(false);
  private onChange?: (value: boolean) => void;
  private onTouched?: () => void;

  writeValue(val: boolean): void {
    this.checked.set(val);
    this.indeterminate.set(false);
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
    this.indeterminate.set(false);
    this.onChange?.(value);
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
  
  onMouseEnter(): void {
    this.hovered.set(true);
  }

  onMouseLeave(): void {
    this.hovered.set(false);
  }
}
