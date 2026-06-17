import {
  Directive,
  forwardRef,
  HostListener,
  input,
  model,
  signal,
  Self,
  Optional,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormFieldControl } from '../form-field';
import { FormFieldTypes } from '../form-field/form-field-types.enum';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[bursitInput], input[bursit-input]',
  host: { 
    class: 'bursit-input', 
    '[disabled]': 'disabled()',
    '[attr.aria-required]': 'required()',
    '[attr.aria-invalid]': 'invalid()'
  },
  providers: [
    {
      provide: FormFieldControl,
      useExisting: forwardRef(() => InputDirective),
    },
  ],
})
export class InputDirective implements OnInit, OnDestroy, FormFieldControl<any> {
  validationInteraction = input<'default' | 'touched'>('default');
  floatingLabel = input<boolean>(false);
  type: FormFieldTypes | undefined = undefined;
  focused = signal(false);
  hovered = signal(false);
  invalid = signal(false);
  hasValue = signal(false);
  private readonly _subscriptions: Array<Subscription> = [];

  required = input<boolean>(false);
  disabled = model<boolean>(false);

  constructor(
    private readonly el: ElementRef,
    @Self() @Optional() public control: NgControl,
  ) {}

  @HostListener('mouseover') onMouseOver() {
    this.hovered.set(true);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hovered.set(false);
  }

  @HostListener('focus') onFocus() {
    this.focused.set(true);
  }

  @HostListener('blur') onBlur() {
    this.focused.set(false);
    // Re-evaluate invalid state after Angular marks the control as touched.
    // Using queueMicrotask ensures the DefaultValueAccessor's blur handler
    // has already called markAsTouched() before we check this.control.touched.
    queueMicrotask(() => {
      this.invalid.set(this.isInputInvalid());
    });
  }

  ngOnInit() {
    this.hasValue.set(this.inputHasValue());
    this.invalid.set(this.isInputInvalid());

    if (this.control) {
      this.disabled.set(this.control.disabled || false);

      const valueSub = this.control.valueChanges?.subscribe(() => this.onValueChanges());
      const statusSub = this.control.statusChanges?.subscribe(() => this.onValueChanges());
      if (valueSub) this._subscriptions.push(valueSub);
      if (statusSub) this._subscriptions.push(statusSub);
    }
  }

  ngOnDestroy() {
    this._subscriptions.forEach((s) => s.unsubscribe());
  }

  private inputHasValue() {
    const value = this.control ? this.control.value : this.el.nativeElement.value;

    const hasValue = !(value === null || value === undefined || value === '' || value.length === 0);

    return hasValue;
  }

  private isInputInvalid(): boolean {
    if (!this.control) {
      return this.el.nativeElement.classList.contains('ng-invalid');
    }

    if (!this.control.invalid) {
      return false;
    }

    if (this.validationInteraction() !== 'touched') {
      return true;
    }

    return !!this.control.touched;
  }

  private onValueChanges() {
    this.disabled.set(this.control.disabled || false);
    this.hasValue.set(this.inputHasValue());
    this.invalid.set(this.isInputInvalid());
  }
}
