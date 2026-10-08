import {
  afterRenderEffect,
  AfterViewInit,
  Component,
  ElementRef,
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
import { FORM_FIELD_ID, FormFieldControl } from '../form-field';
import { resolveAriaDescribedBy } from '../aria-describedby';

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
  private onChange?: (value: boolean) => void;
  private onTouched?: () => void;
  private readonly _subscriptions: Subscription[] = [];
  // Tracks the aria-describedby the author supplied (never clobbered) versus the
  // value this component applied itself, so the sync can safely re-apply on every
  // validity flip without ever overwriting author intent.
  private _userAriaDescribedBy: string | null = null;
  private _appliedAriaDescribedBy: string | null = null;

  inputEl = viewChild<ElementRef<HTMLElement>>('input');

  constructor() {
    if (this.control) {
      this.control.valueAccessor = this;
    }

    // The reactive dependency is the existing `invalid` signal, which
    // `_syncFromControl()` already updates from `control.statusChanges`/`valueChanges`.
    // Reading it here is what registers the dependency: without a signal read the
    // effect would run exactly once and the attribute would go stale on the first
    // validity change.
    //
    // This runs in the render phase, after the form-field template has rendered
    // the `@if`-gated error slot, so the ids resolved below match the DOM that
    // actually exists right now.
    afterRenderEffect(() => {
      this.invalid();
      this._syncAriaDescribedBy();
    });
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
    const el = this.inputEl()?.nativeElement ?? null;
    // Capture the author's value BEFORE wiring, so the sync can tell an author
    // value apart from one this component applied itself.
    this._userAriaDescribedBy = el?.getAttribute('aria-describedby') ?? null;
    this._wireAriaDescribedBy();
    // Record what was just applied. Without this, a control that is already
    // invalid at init would have its own attribute adopted as "author intent" by
    // the first sync run and never update again.
    this._appliedAriaDescribedBy = el?.getAttribute('aria-describedby') ?? null;
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

  private _wireAriaDescribedBy(): void {
    if (this._userAriaDescribedBy !== null) {
      return;
    }

    if (!this._fieldId) {
      return;
    }

    const el = this.inputEl()?.nativeElement;
    if (!el) {
      return;
    }

    const fieldEl = el.closest('bursit-form-field') as HTMLElement | null;
    const describedBy = resolveAriaDescribedBy(fieldEl, this._fieldId);

    if (describedBy !== null) {
      el.setAttribute('aria-describedby', describedBy);
    }
  }

  private _syncAriaDescribedBy(): void {
    if (this._userAriaDescribedBy !== null) {
      return;
    }

    const el = this.inputEl()?.nativeElement;
    if (!el) {
      return;
    }

    // Adopt any value the author introduced after init (template binding or a
    // direct attribute write) so the effect never clobbers author intent.
    const current = el.getAttribute('aria-describedby');
    if (current !== null && current !== this._appliedAriaDescribedBy) {
      this._userAriaDescribedBy = current;
      return;
    }

    // Remove first, then re-resolve: the error slot is rendered inside an `@if`
    // on validity, so a valid -> invalid flip has to be able to ADD a reference
    // and an invalid -> valid flip has to REMOVE the now-dangling one.
    el.removeAttribute('aria-describedby');
    this._appliedAriaDescribedBy = null;
    this._wireAriaDescribedBy();
    this._appliedAriaDescribedBy = el.getAttribute('aria-describedby');
  }
}
