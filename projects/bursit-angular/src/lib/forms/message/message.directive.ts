import { Directive, ElementRef, inject, OnInit, Optional } from '@angular/core';
import { FORM_FIELD_ID } from '../form-field/form-field-id.token';

@Directive({
  selector: '[bursitMessage]',
  host: { class: 'bursit-message' },
})
export class MessageDirective implements OnInit {
  private readonly _el = inject(ElementRef);
  private readonly _fieldId = inject(FORM_FIELD_ID, { optional: true });

  ngOnInit(): void {
    const userSet = this._el.nativeElement.getAttribute('id');
    if (!userSet && this._fieldId) {
      this._el.nativeElement.setAttribute('id', `${this._fieldId}-message`);
    }
  }
}
