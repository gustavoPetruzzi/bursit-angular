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
  afterRenderEffect,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormFieldControl } from '../form-field';
import { FormFieldTypes } from '../form-field/form-field-types.enum';
import { FORM_FIELD_ID } from '../form-field/form-field-id.token';
import { resolveAriaDescribedBy } from '../aria-describedby';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[bursitInput], input[bursit-input], textarea[bursitInput], textarea[bursit-input]',
  host: { 
    class: 'bursit-input', 
    '[disabled]': 'disabled()',
    '[attr.aria-required]': 'required()',
    // Coerced so the attribute is absent when valid, matching checkbox and select.
    // aria-required stays a raw boolean because "false" is valid, meaningful ARIA.
    '[attr.aria-invalid]': 'invalid() ? true : null'
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

  private readonly _fieldId = inject(FORM_FIELD_ID, { optional: true });
  private _userAriaDescribedBy: string | null = null;
  private _appliedAriaDescribedBy: string | null = null;

  constructor(
    private readonly el: ElementRef,
    @Self() @Optional() public control: NgControl,
  ) {
    // Runs in the render phase, after the form-field template has projected the
    // error/message slots, so the queried ids match the rendered DOM.
    afterRenderEffect(() => {
      this.invalid();
      this._syncAriaDescribedBy();
    });
  }

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

    this._wireId();

    this._userAriaDescribedBy = this.el.nativeElement.getAttribute('aria-describedby');
    this._wireAriaDescribedBy();

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

  private _wireId(): void {
    const userSet = this.el.nativeElement.getAttribute('id');
    if (!userSet && this._fieldId) {
      this.el.nativeElement.setAttribute('id', this._fieldId);
    }
  }

  private _wireAriaDescribedBy(): void {
    if (this._userAriaDescribedBy !== null) {
      return;
    }

    if (!this._fieldId) {
      return;
    }

    const fieldEl = this.el.nativeElement.closest('bursit-form-field') as HTMLElement | null;
    const describedBy = resolveAriaDescribedBy(fieldEl, this._fieldId);

    if (describedBy !== null) {
      this.el.nativeElement.setAttribute('aria-describedby', describedBy);
    }
  }

  private _syncAriaDescribedBy(): void {
    if (this._userAriaDescribedBy !== null) {
      return;
    }

    // Adopt any value the author introduced after init (template binding or a
    // direct attribute write) so the effect never clobbers author intent.
    const current = this.el.nativeElement.getAttribute('aria-describedby');
    if (current !== null && current !== this._appliedAriaDescribedBy) {
      this._userAriaDescribedBy = current;
      return;
    }

    this.el.nativeElement.removeAttribute('aria-describedby');
    this._appliedAriaDescribedBy = null;
    this._wireAriaDescribedBy();
    this._appliedAriaDescribedBy = this.el.nativeElement.getAttribute('aria-describedby');
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
