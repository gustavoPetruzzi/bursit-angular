import { Component, computed, inject, input, OnDestroy, OnInit } from '@angular/core';
import { BURSIT_SELECT } from '../select/select-token';

@Component({
  selector: 'bursit-option',
  imports: [],
  templateUrl: './option.html',
  styleUrl: './option.scss',
  host: {
    '[class.bursit-option-selected]': 'selected()',
    '[class.bursit-option-active]': 'active()',
    '[class.bursit-option-disabled]': 'disabled()',
    '(click)': 'onClick()',
  }
})
export class Option implements OnInit, OnDestroy {
  private readonly _select = inject(BURSIT_SELECT, { optional: true});

  readonly value = input.required<string>();
  readonly disabled = input<boolean>(false);
  readonly selected = computed(() => this._select?.value() === this.value());
  readonly active = computed(() => this._select?.activeOption() === this);

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
