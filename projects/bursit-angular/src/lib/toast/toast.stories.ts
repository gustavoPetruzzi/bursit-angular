import { Component, inject } from '@angular/core';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { ToastItemComponent } from './toast-item/toast-item';
import { ToastService } from './toast.service';
import { ToastType } from './toast.types';
import { ButtonDirective } from '../button';

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

type ToastItemArgs = {
  message: string;
  type: ToastType;
  showCloseButton: boolean;
};

// ---------------------------------------------------------------------------
// Trigger component — drives the real service through the CDK overlay
// ---------------------------------------------------------------------------

const MESSAGES: Record<ToastType, string> = {
  success: 'Changes saved successfully',
  info: 'A new version is available',
  warning: 'Your session expires soon',
  error: 'Failed to save your changes',
};

@Component({
  selector: 'story-toast-trigger',
  standalone: true,
  imports: [ButtonDirective],
  template: `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem; padding: 3rem 2rem;">
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem;">
        <button bursitButton (click)="fire('success')">Show success</button>
        <button bursitButton color="secondary" (click)="fire('info')">Show info</button>
        <button bursitButton color="outline" (click)="fire('warning')">Show warning</button>
        <button bursitButton color="danger" (click)="fire('error')">Show error</button>
      </div>
      <button
        bursitButton
        color="link"
        (click)="service.closeAll()"
        style="cursor: pointer;"
      >
        Close all toasts
      </button>
      <p style="margin: 0; font-size: 0.75rem; color: var(--color-text-subtle);">
        Duration: {{ duration }}&nbsp;ms — toasts stack while open
      </p>
    </div>
  `,
})
class ToastTrigger {
  service = inject(ToastService);
  duration = 5000;

  fire(type: ToastType) {
    this.service.show({
      message: MESSAGES[type],
      type,
      duration: this.duration,
    });
  }
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<ToastItemArgs> = {
  title: 'Components/Toast',
  component: ToastItemComponent,
  decorators: [moduleMetadata({ imports: [ToastItemComponent, ToastTrigger] })],
  argTypes: {
    message: {
      control: 'text',
      description: 'Text shown inside the toast',
    },
    type: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error'] as ToastType[],
      description: 'Visual variant — also drives ARIA role and host class',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Whether the dismiss button is rendered',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Toast notification shown via a CDK overlay. The item component renders the message with a per-type host class and ARIA role; the service manages the overlay, auto-dismiss timer, and close-all behavior.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<ToastItemArgs>;

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

const ItemTemplate: Story['render'] = (args) => ({
  props: args,
  template: `
    <div style="display: flex; justify-content: center; padding: 3rem 2rem;">
      <bursit-toast-item
        [message]="message"
        [type]="type"
        [showCloseButton]="showCloseButton"
      ></bursit-toast-item>
    </div>
  `,
});

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * The toast item in isolation with message, type, and close button controls.
 * This is what one toast looks like before the overlay is applied.
 */
export const Item: Story = {
  args: {
    message: 'Changes saved successfully',
    type: 'success',
    showCloseButton: true,
  },
  render: ItemTemplate,
};

/**
 * All four variants side by side for quick visual comparison.
 */
export const Types: Story = {
  args: {
    message: 'Sample message',
    type: 'success',
    showCloseButton: true,
  },
  render: () => ({
    template: `
      <div style="display: grid; gap: 1rem; padding: 3rem 2rem; justify-items: center;">
        <bursit-toast-item message="Changes saved successfully" type="success"></bursit-toast-item>
        <bursit-toast-item message="A new version is available" type="info"></bursit-toast-item>
        <bursit-toast-item message="Your session expires soon" type="warning"></bursit-toast-item>
        <bursit-toast-item message="Failed to save your changes" type="error"></bursit-toast-item>
      </div>
    `,
  }),
};

/**
 * The real ToastService: clicking a button opens an actual overlay toast.
 * Toasts stack, auto-dismiss after the duration, and can be closed all at once.
 */
export const Service: Story = {
  args: {
    message: 'Changes saved successfully',
    type: 'success',
    showCloseButton: true,
  },
  render: () => ({
    template: `<story-toast-trigger></story-toast-trigger>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Drives <code>ToastService</code> directly — 5s default duration, stacking overlays, close-all button. Honors the <code>position</code> option (defaults to bottom-right).',
      },
    },
  },
};