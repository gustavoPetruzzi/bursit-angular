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
  computed,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormFieldControl } from '../form-field';
import { FormField } from '../form-field/form-field';
import { FormFieldTypes } from '../form-field/form-field-types.enum';
import { FORM_FIELD_ID } from '../form-field/form-field-id.token';
import { resolveDescribedBy } from '../aria-describedby';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[bursitInput], input[bursit-input], textarea[bursitInput], textarea[bursit-input]',
  host: { 
    class: 'bursit-input', 
    '[disabled]': 'disabled()',
    '[attr.aria-required]': 'required()',
    // Coerced so the attribute is absent when valid, matching checkbox and select.
    // aria-required stays a raw boolean because "false" is valid, meaningful ARIA.
    '[attr.aria-invalid]': 'invalid() ? true : null',
    '[attr.aria-describedby]': 'describedBy()'
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
  private readonly _field = inject(FormField, { optional: true });
  private readonly _hostEl = inject(ElementRef<HTMLElement>);
  // Captured once in ngOnInit, before the host binding applies our value, so an
  // author-supplied `[attr.aria-describedby]` survives every validity flip.
  // This reads the control's OWN element, never the parent form-field's DOM.
  private _authorDescribedBy: string | null = null;

  // Derived reactively instead of written imperatively after render: the value
  // depends only on the field's declared slots and this control's validity.
  readonly describedBy = computed<string | null>(() => {
    if (this._authorDescribedBy) {
      return this._authorDescribedBy;
    }
    return this._field
      ? resolveDescribedBy(
          this._field.fieldId,
          !!this._field.hasError(),
          !!this._field.hasMessage(),
          this.invalid(),
        )
      : null;
  });

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

    this._wireId();

    // The author's aria-describedby, if any, rides on this same element and is
    // applied by the template binding before ngOnInit. Capture it once here,
    // before the host binding can overwrite it.
    this._authorDescribedBy = this._hostEl.nativeElement.getAttribute('aria-describedby');

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
