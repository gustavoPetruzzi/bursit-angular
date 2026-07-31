import { Component, computed, input } from '@angular/core';
import { LucideChevronDown, LucideSearch, LucideX, LucideDynamicIcon, LucideChevronUp } from '@lucide/angular';
import type { LucideIcon } from '@lucide/angular';

const ICON_MAP: Record<string, LucideIcon> = {
  'chevron-down': LucideChevronDown,
  'chevron-up': LucideChevronUp,
  'search': LucideSearch,
  'x': LucideX,
};

@Component({
  selector: 'bursit-icon',
  imports: [LucideDynamicIcon],
  template: `
    <svg [lucideIcon]="resolvedIcon()" [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()"></svg>`,
  styleUrl: './icon.scss',
})
export class BursitIconComponent {
  name = input.required<string>();
  size = input(16);
  color = input('currentColor');
  strokeWidth = input(2);
  resolvedIcon = computed(() => ICON_MAP[this.name()]);

}
