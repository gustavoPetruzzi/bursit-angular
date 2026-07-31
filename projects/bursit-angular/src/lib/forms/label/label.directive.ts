import { Directive, ElementRef, inject, OnInit, Optional } from '@angular/core';
import { FORM_FIELD_ID } from '../form-field/form-field-id.token';

@Directive({
  selector: '[bursit-label], [bursitLabel]',
  host: { class: 'bursit-label' },
})
export class LabelDirective implements OnInit {
  private readonly _el = inject(ElementRef);
  private readonly _fieldId = inject(FORM_FIELD_ID, { optional: true });

  ngOnInit(): void {
    if (this._fieldId) {
      const userSetFor = this._el.nativeElement.getAttribute('for');
      if (!userSetFor) {
        this._el.nativeElement.setAttribute('for', this._fieldId);
      }

      const userSetId = this._el.nativeElement.getAttribute('id');
      if (!userSetId) {
        this._el.nativeElement.setAttribute('id', `${this._fieldId}-label`);
      }
    }
  }
}
