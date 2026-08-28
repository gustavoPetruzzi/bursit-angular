import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
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
  private static _nextUid = 0;

  private readonly scrollStrategyOptions = inject(ScrollStrategyOptions);
  protected readonly scrollStrategy = this.scrollStrategyOptions.reposition();
  private readonly _fieldId = inject(FORM_FIELD_ID, { optional: true });
  control = inject(NgControl, { self: true, optional: true });

  readonly uid: string = this._fieldId ?? `bursit-select-${Select._nextUid++}`;
  readonly panelId = `${this.uid}-listbox`;

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

  protected readonly activeDescendantId = computed<string | null>(() => {
    const active = this.activeOption();
    return this.isOpen() && active ? active.optionId : null;
  });

  protected readonly displayLabel = computed<string | null>(() => {
    const value = this.value();
    if (value === null || value === '') return null;
    return this.options().find((option) => option.value() === value)?.label ?? value;
  });

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
      this.activeOption.set(this._initialActiveOption());
      this._scrollActiveIntoView();
    } else {
      this.activeOption.set(null);
    }
  }

  close(): void {
    if (!this.isOpen()) return;

    this.isOpen.set(false);
    this.activeOption.set(null);
    this._unsetFocusedIfTriggerUnfocused();
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
    this.activeOption.set(null);
    this._onTouched();
    this._unsetFocusedIfTriggerUnfocused();
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.isOpen()) {
          this._selectActive();
        } else {
          this.toggle();
        }
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.close();
          this.trigger().nativeElement.focus();
        }
        break;
      case 'Tab':
        if (this.isOpen()) {
          this.close();
        }
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen()) {
          this._navigate(event.key);
        } else {
          this.toggle();
        }
        break;
      case 'Home':
      case 'End':
        if (this.isOpen()) {
          event.preventDefault();
          this._navigate(event.key);
        }
        break;
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

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
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

  private _enabledOptions(): Option[] {
    return this.options().filter((option) => !option.disabled());
  }
  private _unsetFocusedIfTriggerUnfocused(): void {
    if (document.activeElement !== this.trigger().nativeElement) {
      this.focused.set(false);
    }
  }

  private _initialActiveOption(): Option | null {
    const value = this.value();
    if (value !== null && value !== '') {
      const match = this.options().find((option) => option.value() === value);
      if (match && !match.disabled()) return match;
    }
    return null;
  }

  private _navigate(key: string): void {
    const enabled = this._enabledOptions();
    if (!enabled.length) return;

    const current = this.activeOption();
    const currentIndex = current ? enabled.indexOf(current) : -1;

    switch (key) {
      case 'ArrowDown': {
        const nextIndex = currentIndex + 1;
        if (nextIndex < enabled.length) {
          this.activeOption.set(enabled[nextIndex]);
        }
        break;
      }
      case 'ArrowUp': {
        if (currentIndex === -1) {
          this.activeOption.set(enabled[enabled.length - 1]);
          break;
        }
        const previousIndex = currentIndex - 1;
        if (previousIndex >= 0) {
          this.activeOption.set(enabled[previousIndex]);
        }
        break;
      }
      case 'Home':
        this.activeOption.set(enabled[0]);
        break;
      case 'End':
        this.activeOption.set(enabled[enabled.length - 1]);
        break;
    }

    this._scrollActiveIntoView();
  }

  private _scrollActiveIntoView(): void {
    const id = this.activeDescendantId();
    if (!id) return;
    document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' });
  }

  private _selectActive(): void {
    const active = this.activeOption();
    if (!active) {
      this.close();
      return;
    }
    if (!active.disabled()) {
      this.selectOption(active.value());
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
