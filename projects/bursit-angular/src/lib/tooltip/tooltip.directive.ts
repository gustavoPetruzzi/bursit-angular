import { ConnectedPosition, Overlay, OverlayRef } from "@angular/cdk/overlay";
import { Directive, inject, input, TemplateRef, output, ElementRef } from "@angular/core";
import { TooltipPosition } from "./tooltip-position.type";
import { TooltipPanel } from "./tooltip-panel/tooltip-panel";
import { ComponentPortal } from "@angular/cdk/portal";

// Static counter so each attached panel gets a unique id for aria-describedby.
let tooltipCounter = 0;

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

  content = input<string | TemplateRef<unknown> | null>(null, { alias: 'bursitTooltip' });
  position = input<TooltipPosition>('top');
  showDelay = input<number>(300);
  hideDelay = input<number>(100);
  disabled = input<boolean>(false);
  arrow = input<boolean>(true);


  private _overlay = inject(Overlay);
  private el: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  private _overlayRef: OverlayRef | null = null;
  

  shown = output<void>();
  hidden = output<void>();
  
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private _panelId: string | null = null;
  private _originalDescribedBy: string | null = null;

  _show() {
    if (this.disabled()) {
      return;
    }

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    this.showTimer = setTimeout(() => {
      const value = this.content();
      if (value === null || value === undefined) {
        return;
      }

      this._overlayRef = this._overlay.create({
        positionStrategy: this._overlay.position()
          .flexibleConnectedTo(this.el)
          .withPositions(this._buildPositions(this.position()))
      });

      const panelId = `bursit-tooltip-${++tooltipCounter}`;
      const portal = new ComponentPortal(TooltipPanel);
      const panelRef = this._overlayRef.attach(portal);

      panelRef.setInput('panelId', panelId);
      panelRef.setInput('content', value);
      panelRef.setInput('position', this.position());
      panelRef.setInput('arrow', this.arrow());

      this._panelId = panelId;
      this._setDescribedBy();

      this.shown.emit();
    }, this.showDelay());
  }

  _hide() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    this.hideTimer = setTimeout(() => {
      if (this._overlayRef) {
        this._overlayRef.dispose();
        this._overlayRef = null;
        this._clearDescribedBy();
        this.hidden.emit();
      }
    }, this.hideDelay());
  }

  private _buildPositions(preferred: TooltipPosition): ConnectedPosition[] {
    const positions: Record<TooltipPosition, ConnectedPosition> = {
      top:    { originX: 'center', originY: 'top',    overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
      bottom: { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
      left:   { originX: 'start',  originY: 'center', overlayX: 'end',    overlayY: 'center', offsetX: -8 },
      right:  { originX: 'end',    originY: 'center', overlayX: 'start',  overlayY: 'center', offsetX: 8 },
    };

    const order: TooltipPosition[] = [preferred, ...(['top', 'bottom', 'left', 'right'] as TooltipPosition[]).filter((p) => p !== preferred)];
    return order.map((p) => positions[p]);
  }

  private _setDescribedBy(): void {
    if (!this._panelId) return;
    const current = this.el.getAttribute('aria-describedby');
    this._originalDescribedBy = current;
    const next = current ? `${current} ${this._panelId}` : this._panelId;
    this.el.setAttribute('aria-describedby', next);
  }

  private _clearDescribedBy(): void {
    if (this._originalDescribedBy === null) {
      this.el.removeAttribute('aria-describedby');
    } else {
      this.el.setAttribute('aria-describedby', this._originalDescribedBy);
    }
    this._originalDescribedBy = null;
  }
}
