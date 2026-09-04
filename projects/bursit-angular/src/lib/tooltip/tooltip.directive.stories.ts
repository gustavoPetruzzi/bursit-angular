import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgTemplateOutlet } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';

import { TooltipDirective } from './tooltip.directive';
import { TooltipPosition } from './tooltip-position.type';
import { ButtonDirective } from '../button';

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

type TooltipStoryArgs = {
  bursitTooltip: string;
  position: TooltipPosition;
  showDelay: number;
  hideDelay: number;
  disabled: boolean;
  arrow: boolean;
};

const SHARED_IMPORTS = [TooltipDirective, ButtonDirective, NgTemplateOutlet, OverlayModule];

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<TooltipStoryArgs> = {
  title: 'Directives/Tooltip',
  component: TooltipDirective,
  decorators: [moduleMetadata({ imports: SHARED_IMPORTS })],
  argTypes: {
    bursitTooltip: {
      control: 'text',
      description: 'Text shown inside the tooltip panel',
    },
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'] as TooltipPosition[],
      description: 'Preferred edge where the tooltip opens. Flips automatically when there is no room.',
    },
    showDelay: {
      control: 'number',
      description: 'Milliseconds to wait before showing after hover/focus',
    },
    hideDelay: {
      control: 'number',
      description: 'Milliseconds to wait before hiding after leave/blur',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether showing is suppressed entirely',
    },
    arrow: {
      control: 'boolean',
      description: 'Whether the directional arrow is shown',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Attribute directive `[bursitTooltip]` that shows contextual help near its host via a CDK overlay. Hover/focus to show, leave/blur or Escape to hide, with configurable delays, flip-on-overflow positioning, and ARIA wiring (`aria-describedby`).',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<TooltipStoryArgs>;

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

const DefaultTemplate: Story['render'] = (args) => ({
  props: args,
  template: `
    <div style="display: flex; justify-content: center; padding: 4rem 2rem;">
      <button
        bursitButton
        [bursitTooltip]="bursitTooltip"
        [position]="position"
        [showDelay]="showDelay"
        [hideDelay]="hideDelay"
        [disabled]="disabled"
        [arrow]="arrow"
      >
        Hover or focus me
      </button>
    </div>
  `,
});

// Position demo — a button in the middle of a roomy stage so flipping can be seen
const PositionTemplate: Story['render'] = (args) => ({
  props: args,
  template: `
    <div style="display: grid; place-items: center; height: 60vh; padding: 2rem;">
      <div style="display: grid; grid-template-columns: repeat(2, auto); gap: 3rem;">
        <div>
          <span style="font-size: 0.75rem; color: var(--color-neutral-500);">top</span>
          <button bursitButton bursitTooltip="Top tooltip" [position]="'top'" style="display:block; margin-top: .5rem;">Hover</button>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--color-neutral-500);">bottom</span>
          <button bursitButton bursitTooltip="Bottom tooltip" [position]="'bottom'" style="display:block; margin-top: .5rem;">Hover</button>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--color-neutral-500);">left</span>
          <button bursitButton bursitTooltip="Left tooltip" [position]="'left'" style="display:block; margin-top: .5rem;">Hover</button>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--color-neutral-500);">right</span>
          <button bursitButton bursitTooltip="Right tooltip" [position]="'right'" style="display:block; margin-top: .5rem;">Hover</button>
        </div>
      </div>
    </div>
  `,
});

// TemplateRef demo — rich content via ng-template
const TemplateRefTemplate: Story['render'] = (args) => ({
  props: args,
  template: `
    <div style="display: flex; justify-content: center; padding: 4rem 2rem;">
      <button bursitButton [bursitTooltip]="detail">
        Hover for rich content
      </button>
      <ng-template #detail>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <strong>Danger zone</strong>
          <span>This action cannot be undone.</span>
        </div>
      </ng-template>
    </div>
  `,
});

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Default tooltip: top position, arrow, default delays (300ms show / 100ms hide).
 * Hover or focus the button to reveal it, leave or press Escape to hide.
 */
export const Default: Story = {
  args: {
    bursitTooltip: 'Save changes',
    position: 'top',
    showDelay: 300,
    hideDelay: 100,
    disabled: false,
    arrow: true,
  },
  render: DefaultTemplate,
};

/**
 * All four positions side by side so the arrow re-orientation is easy to compare.
 */
export const Positions: Story = {
  args: {
    bursitTooltip: 'Tooltip',
    position: 'top',
    showDelay: 300,
    hideDelay: 100,
    disabled: false,
    arrow: true,
  },
  render: PositionTemplate,
};

/**
 * Tooltip with no arrow — pure callout bubble without a pointer.
 */
export const NoArrow: Story = {
  args: {
    bursitTooltip: 'Just a flat bubble',
    position: 'top',
    showDelay: 300,
    hideDelay: 100,
    disabled: false,
    arrow: false,
  },
  render: DefaultTemplate,
};

/**
 * Slower show delay — hover and wait to see the tooltip appear smoothly.
 */
export const LongDelay: Story = {
  args: {
    bursitTooltip: 'This one waits a bit',
    position: 'bottom',
    showDelay: 1000,
    hideDelay: 100,
    disabled: false,
    arrow: true,
  },
  render: DefaultTemplate,
};

/**
 * Disabled tooltip — hovering or focusing does nothing.
 */
export const Disabled: Story = {
  args: {
    bursitTooltip: 'You should not see me',
    position: 'top',
    showDelay: 300,
    hideDelay: 100,
    disabled: true,
    arrow: true,
  },
  render: DefaultTemplate,
};

/**
 * Rich content rendered from an `ng-template` (e.g. mixed markup or icons).
 */
export const TemplateRef: Story = {
  args: {
    bursitTooltip: 'Rich content',
    position: 'top',
    showDelay: 300,
    hideDelay: 100,
    disabled: false,
    arrow: true,
  },
  render: TemplateRefTemplate,
};

/**
 * Interactive playground with every control exposed.
 */
export const Playground: Story = {
  args: {
    bursitTooltip: 'Play with the controls',
    position: 'top',
    showDelay: 300,
    hideDelay: 100,
    disabled: false,
    arrow: true,
  },
  render: DefaultTemplate,
  parameters: {
    docs: {
      description: {
        story: 'Use the Controls panel to change position, delays, the arrow, and disabled state.',
      },
    },
  },
};
