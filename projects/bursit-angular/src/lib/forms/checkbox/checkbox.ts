import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FORM_FIELD_ID, FormField, FormFieldControl } from '../form-field';
import { resolveDescribedBy } from '../aria-describedby';

@Component({
  selector: 'bursit-checkbox',
  imports: [],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
  providers: [
    {
      provide: FormFieldControl,
      useExisting: forwardRef(() => Checkbox)
    }
  ],
  host: {
    '[class.bursit-checkbox-checked]': "checked()",
    '[class.bursit-checkbox-indeterminate]': 'indeterminate()',
    '[class.bursit-checkbox-disabled]': 'disabled()',
    '[class.bursit-checkbox-focused]': 'focused()',
  }
})
export class Checkbox implements ControlValueAccessor, FormFieldControl<boolean>, OnInit, AfterViewInit, OnDestroy {

  checked = model(false);
  indeterminate = model(false);
  required = input(false);
  disabled = model(false);
  validationInteraction = input<'default' | 'touched'>('default');
  readonly focused = signal(false);
  readonly hovered = signal(false);
  readonly invalid = signal(false);
  control = inject(NgControl, { self: true, optional: true });
  private readonly _fieldId = inject(FORM_FIELD_ID, { optional: true });
  private readonly _field = inject(FormField, { optional: true });
  private readonly _hostEl = inject(ElementRef<HTMLElement>);
  private onChange?: (value: boolean) => void;
  private onTouched?: () => void;
  private readonly _subscriptions: Subscription[] = [];

  inputEl = viewChild<ElementRef<HTMLElement>>('input');

  // Derived reactively instead of written imperatively after render. An author's
  // `[attr.aria-describedby]` on the `<bursit-checkbox>` host wins; otherwise the
  // value comes from the field's DECLARED slots and this control's validity.
  readonly describedBy = computed<string | null>(() => {
    const author = this._hostEl.nativeElement.getAttribute('aria-describedby');
    if (author) {
      return author;
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

  constructor() {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    if (this.control) {
      const valueSub = this.control.valueChanges?.subscribe(() => this._syncFromControl());
      const statusSub = this.control.statusChanges?.subscribe(() => this._syncFromControl());
      if (valueSub) this._subscriptions.push(valueSub);
      if (statusSub) this._subscriptions.push(statusSub);
    }
    this._syncFromControl();
  }

  ngAfterViewInit(): void {
    this._wireId();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((s) => s.unsubscribe());
  }

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
    this.invalid.set(this._isInvalid());
  }
  
  onMouseEnter(): void {
    this.hovered.set(true);
  }

  onMouseLeave(): void {
    this.hovered.set(false);
  }

  private _syncFromControl(): void {
    this.invalid.set(this._isInvalid());
  }

  private _isInvalid(): boolean {
    if (!this.control) return false;
    return (
      !!this.control.invalid &&
      (this.validationInteraction() === 'touched' ? !!this.control.touched : true)
    );
  }

  private _wireId(): void {
    const el = this.inputEl()?.nativeElement;
    const userSet = el?.getAttribute('id');
    if (!userSet && this._fieldId) {
      el?.setAttribute('id', this._fieldId);
    }
  }
}
