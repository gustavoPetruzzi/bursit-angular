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
  host: { class: 'bursit-input', '[disabled]': 'disabled()' },
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
  stateChanges = signal(0);
  type: FormFieldTypes | undefined = undefined;
  focused = false;
  hovered = false;
  invalid = false;
  hasValue = false;
  private readonly _subscriptions: Array<Subscription> = [];

  required = input<boolean>(false);
  disabled = model<boolean>(false);

  constructor(
    private readonly el: ElementRef,
    @Self() @Optional() public control: NgControl,
  ) {}

  @HostListener('mouseover') onMouseOver() {
    this.hovered = true;
    this.stateChanges.update((v) => v + 1);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hovered = false;
    this.stateChanges.update((v) => v + 1);
  }

  @HostListener('keyup') onKeyUp() {
    this.invalid = false;
    this.stateChanges.update((v) => v + 1);
  }

  @HostListener('focus') onFocus() {
    this.focused = true;
    this.stateChanges.update((v) => v + 1);
  }

  @HostListener('blur') onBlur() {
    this.focused = false;
    this.stateChanges.update((v) => v + 1);
  }

  ngOnInit() {
    this.hasValue = this.inputHasValue();
    this.invalid = this.isInputInvalid();

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

    return !!(this.control.dirty || this.control.touched);
  }

  private onValueChanges() {
    this.disabled.set(this.control.disabled || false);
    this.hasValue = this.inputHasValue();
    this.invalid = this.isInputInvalid();
    this.stateChanges.update((v) => v + 1);
  }
}
