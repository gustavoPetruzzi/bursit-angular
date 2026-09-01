import { ChangeDetectionStrategy, Component, computed, input, TemplateRef } from '@angular/core';
import { TooltipPosition } from '../tooltip-position.type';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'bursit-tooltip-panel',
  imports: [NgTemplateOutlet],
  templateUrl: './tooltip-panel.html',
  host: {
    role: 'tooltip',
    '[id]': 'panelId',
    '[class]': 'hostClasses()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipPanel {
  content = input<string | TemplateRef<unknown>>();
  isString = computed(() => typeof this.content() === 'string');
  
  position = input<TooltipPosition>('top');
  arrow = input(true);
  panelId = input.required<string>();

  hostClasses = computed(() =>
    `bursit-tooltip bursit-tooltip-${this.position()}${this.arrow() ? '' : ' bursit-tooltip-no-arrow'}`
  );
}