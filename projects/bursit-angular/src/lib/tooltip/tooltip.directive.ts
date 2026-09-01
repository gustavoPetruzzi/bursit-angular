import { Directive } from "@angular/core";


@Directive({
  selector: '[bursitTooltip], [bursit-tooltip]',
  host: {
    '(mouseenter)': '_show()',
    '(mouseleave)': '_hide()',
    '(focusin)': '_show()',
    '(focusout)': '_hide()',
    '(keydown)': '_hide()'
  }
})
export class TooltipDirective {


  _show() {

  }

  _hide() {

  }
}