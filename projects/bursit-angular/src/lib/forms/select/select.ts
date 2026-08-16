import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormFieldControl } from '../form-field';
import { FormFieldTypes } from '../form-field/form-field-types.enum';
import { FORM_FIELD_ID } from '../form-field/form-field-id.token';
import { ConnectedPosition, OverlayModule, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { BursitIconComponent } from '../../icon';
import { BURSIT_SELECT } from './select-token';
import type { Option } from '../option/option';

@Component({
  selector: 'bursit-select',
  imports: [OverlayModule, BursitIconComponent],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  host: {
    '[class.bursit-select-disabled]': 'disabled()',
    '[class.bursit-select-invalid]': 'invalid()',
  },
  providers: [
    {
      provide: FormFieldControl,
      useExisting: forwardRef(() => Select),
    },
    {
      provide: BURSIT_SELECT,
      useExisting: forwardRef(() => Select)
    }
  ],
})
export class Select
  implements FormFieldControl<any>, ControlValueAccessor, OnInit, AfterViewInit, OnDestroy
{
  private readonly scrollStrategyOptions = inject(ScrollStrategyOptions);
  protected readonly scrollStrategy = this.scrollStrategyOptions.reposition();
  private readonly _fieldId = inject(FORM_FIELD_ID, { optional: true });
  control = inject(NgControl, { self: true, optional: true });

  floatingLabel = input<boolean>(false);
  placeholder = input<string>('');
  required = input<boolean>(false);
  disabled = model<boolean>(false);
  tabIndex = input<number>(0);
  ariaLabel = input<string>('');

  _positions: ConnectedPosition[] =  [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 8
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetY: -8
    },
    {
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center',
      offsetX: 8,
    },
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -8
    },
  ];
  readonly type = FormFieldTypes.SELECT;
  readonly focused = signal(false);
  readonly hovered = signal(false);
  readonly invalid = signal(false);
  readonly hasValue = signal(false);
  readonly activeOption = signal<Option | null>(null);
  readonly options = signal<Option[]>([]);
  value = model<string | null>(null);
  readonly isOpen = signal(false);
  trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');

  private _onChange: (val: string) => void = () => {};
  private _onTouched: () => void = () => {};
  private readonly _subscriptions: Subscription[] = [];

  get hasPlaceholder(): boolean {
    return this.placeholder() !== '';
  }

  constructor() {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  registerOption(option: Option): void {
    this.options.update(options => [...options, option]);
  }

  ngOnInit(): void {
    this._syncFromControl();

    if (this.control) {
      const valueSub = this.control.valueChanges?.subscribe(() =>
        this._syncFromControl(),
      );
      const statusSub = this.control.statusChanges?.subscribe(() =>
        this._syncFromControl(),
      );
      if (valueSub) this._subscriptions.push(valueSub);
      if (statusSub) this._subscriptions.push(statusSub);
    }
  }

  ngAfterViewInit(): void {
    this._wireId();
    this._wireAriaLabelledBy();
    this._wireAriaDescribedBy();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((s) => s.unsubscribe());
  }

  unregisterOption(option: Option): void {
    this.options.update(options => options.filter(o => o !== option));
  }


  toggle(): void {
    if (this.disabled()) return;

    this.isOpen.update((prev) => !prev);

    if (this.isOpen()) {
      this.focused.set(true);
      this.trigger().nativeElement.focus();
    }
  }

  close(): void {
    if (!this.isOpen()) return;

    this.isOpen.set(false);

    if (document.activeElement !== this.trigger().nativeElement) {
      this.focused.set(false);
    }
  }

  selectOption(value: string): void {
    this.value.set(value);
    this._onChange(value);
    this._onTouched();
    this._syncFromControl();
    this.close();
  }

  onOverlayDetach(): void {
    this.isOpen.set(false);
    this._onTouched();

    if (document.activeElement !== this.trigger().nativeElement) {
      this.focused.set(false);
    }
  }

  onFocus(): void {
    this.focused.set(true);
  }

  onBlur(): void {
    if (!this.isOpen()) {
      this.focused.set(false);
      this._onTouched();
      this.invalid.set(this._isInvalid());
    }
  }

  onMouseEnter(): void {
    this.hovered.set(true);
  }

  onMouseLeave(): void {
    this.hovered.set(false);
  }

  writeValue(val: string): void {
    this.value.set(val);
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  private _wireAriaLabelledBy(): void {
    const el = this.trigger().nativeElement;
    const hasAriaLabel = el.getAttribute('aria-label');
    const hasAriaLabelledBy = el.getAttribute('aria-labelledby');
    if (!hasAriaLabel && !hasAriaLabelledBy && this._fieldId) {
      el.setAttribute('aria-labelledby', `${this._fieldId}-label`);
    }
  }

  private _wireId(): void {
    const el = this.trigger().nativeElement;
    const userSet = el.getAttribute('id');
    if (!userSet && this._fieldId) {
      el.setAttribute('id', this._fieldId);
    }
  }

  private _wireAriaDescribedBy(): void {
    const el = this.trigger().nativeElement;
    const userSet = el.getAttribute('aria-describedby');
    if (!userSet && this._fieldId) {
      el.setAttribute(
        'aria-describedby',
        `${this._fieldId}-error ${this._fieldId}-message`,
      );
    }
  }

  private _controlHasValue(): boolean {
    const value = this.control ? this.control.value : this.value();
    return value !== null && value !== '';
  }

  private _isInvalid(): boolean {
    if (!this.control) return false;
    return !!this.control.invalid && !!this.control.touched;
  }

  private _syncFromControl(): void {
    this.hasValue.set(this._controlHasValue());
    this.invalid.set(this._isInvalid());

    if (this.control) {
      this.disabled.set(this.control.disabled || false);
    }
  }
}
