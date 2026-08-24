import { Component, computed, ElementRef, inject, input, OnDestroy, OnInit } from '@angular/core';
import { BURSIT_SELECT } from '../select/select-token';

let nextOptionUid = 0;

@Component({
  selector: 'bursit-option',
  imports: [],
  templateUrl: './option.html',
  styleUrl: './option.scss',
  host: {
    '[attr.id]': 'optionId',
    '[class.bursit-option-selected]': 'selected()',
    '[class.bursit-option-active]': 'active()',
    '[class.bursit-option-disabled]': 'disabled()',
    '(click)': 'onClick()',
  }
})
export class Option implements OnInit, OnDestroy {
  private readonly _select = inject(BURSIT_SELECT, { optional: true});
  private readonly _elementRef = inject(ElementRef);

  readonly optionId = `bursit-select-option-${nextOptionUid++}`;
  readonly value = input.required<string>();
  readonly disabled = input<boolean>(false);
  readonly selected = computed(() => this._select?.value() === this.value());
  readonly active = computed(() => this._select?.activeOption() === this);

  /**
   * Projected label text, read lazily from the host's textContent. Read at
   * display time (not registration time) so interpolated child text is
   * guaranteed to be rendered.
   */
  get label(): string {
    return (this._elementRef.nativeElement.textContent ?? '').trim();
  }

  ngOnInit(): void {
    this._select?.registerOption(this);
  }

  ngOnDestroy(): void {
    this._select?.unregisterOption(this);
  }

  onClick(): void {
    if(!this.disabled() && this._select) {
      this._select.selectOption(this.value());
    }
  }
}
