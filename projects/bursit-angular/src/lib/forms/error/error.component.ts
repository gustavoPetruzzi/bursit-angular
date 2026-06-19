import { Component, ElementRef, inject, OnInit, Optional } from '@angular/core';
import { FORM_FIELD_ID } from '../form-field/form-field-id.token';

@Component({
  selector: '[bursitError]',
  template: `
    <ng-content></ng-content>
  `,
  styleUrl: './error.component.scss',
  host: { class: 'bursit-error', role: 'alert' },
})
export class ErrorComponent implements OnInit {
  private readonly _el = inject(ElementRef);
  private readonly _fieldId = inject(FORM_FIELD_ID, { optional: true });

  ngOnInit(): void {
    const userSet = this._el.nativeElement.getAttribute('id');
    if (!userSet && this._fieldId) {
      this._el.nativeElement.setAttribute('id', `${this._fieldId}-error`);
    }
  }
}
