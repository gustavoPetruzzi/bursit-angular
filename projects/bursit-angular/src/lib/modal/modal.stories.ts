import { Component, inject, input } from '@angular/core';
import { Meta, StoryObj, moduleMetadata, argsToTemplate } from '@storybook/angular';

import { ModalService } from './modal.service';
import { ModalComponent } from './modal.component';
import { ModalHeaderDirective } from './modal-header.directive';
import { ModalBodyDirective } from './modal-body.directive';
import { ModalFooterDirective } from './modal-footer.directive';
import { MODAL_REF, ModalConfig, ModalSize } from './modal.config';
import { ModalRef } from './modal-ref';
import { ButtonDirective } from '../button';

// ===========================================================================
// Content components — what gets rendered inside the modal
// ===========================================================================

@Component({
  standalone: true,
  imports: [ModalComponent, ModalHeaderDirective, ModalBodyDirective, ModalFooterDirective, ButtonDirective],
  template: `
    <bursit-modal>
      <div bursitModalHeader
           style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--color-border);
                  font-weight: 600;">
        Delete Item
      </div>
      <div bursitModalBody style="padding: 1.5rem;">
        <p style="margin: 0; color: var(--color-neutral-500);">
          Are you sure you want to delete this item? This action cannot be undone.
        </p>
      </div>
      <div bursitModalFooter
           style="padding: 1rem 1.5rem; border-top: 1px solid var(--color-border);
                  display: flex; justify-content: flex-end; gap: 0.5rem;">
        <button bursitButton color="secondary" (click)="ref.dismiss()">
          Cancel
        </button>
        <button bursitButton (click)="ref.close({ deleted: true })">
          Delete
        </button>
      </div>
    </bursit-modal>
  `,
})
class SlotModalContent {
  ref = inject<ModalRef<SlotModalContent>>(MODAL_REF);
}

@Component({
  standalone: true,
  imports: [ButtonDirective],
  template: `
    <div style="padding: 2rem; text-align: center; background: var(--color-bg-elevated);
                border: 2px solid var(--color-border-strong); border-radius: var(--radius-lg);">
      <h3 style="margin: 0 0 0.75rem;">Service API</h3>
      <p style="margin: 0 0 1.25rem; color: var(--color-neutral-500);">
        Opened via <code>ModalService.open(Component)</code>.<br/>
        Press <strong>ESC</strong> or click backdrop to close.
      </p>
      <button bursitButton (click)="ref.close()">
        Close me
      </button>
    </div>
  `,
})
class ServiceContent {
  ref = inject<ModalRef<ServiceContent>>(MODAL_REF);
}

// ===========================================================================
// Trigger — single component reused for both stories via content input
// ===========================================================================

@Component({
  selector: 'story-modal-trigger',
  standalone: true,
  imports: [ButtonDirective],
  template: `<button bursitButton (click)="open()">{{ label() }}</button>`,
})
class ModalTrigger {
  readonly label = input('Open Modal');
  readonly size = input<ModalSize>(ModalSize.MEDIUM);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly backdropClosable = input(true);
  readonly escClosable = input(true);
  readonly hasBackdrop = input(true);
  readonly content = input<'slots' | 'service'>('slots');

  private ms = inject(ModalService);

  open(): void {
    const component = this.content() === 'slots' ? SlotModalContent : ServiceContent;
    const config: ModalConfig = {
      size: this.size(),
      backdropClosable: this.backdropClosable(),
      escClosable: this.escClosable(),
      hasBackdrop: this.hasBackdrop(),
    };
    const label = this.ariaLabel();
    if (label) config.ariaLabel = label;
    const labelledBy = this.ariaLabelledBy();
    if (labelledBy) config.ariaLabelledBy = labelledBy;
    this.ms.open(component, config);
  }
}

// ===========================================================================
// Meta — argTypes drive Storybook Controls panel
// ===========================================================================

const meta: Meta<ModalTrigger> = {
  title: 'Components/Modal',
  component: ModalComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ModalComponent,
        ModalHeaderDirective,
        ModalBodyDirective,
        ModalFooterDirective,
        ModalTrigger,
      ],
    }),
  ],
  argTypes: {
    size: {
      control: 'select',
      options: Object.values(ModalSize),
      description: 'Modal width variant',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name for the dialog (screen readers)',
    },
    ariaLabelledBy: {
      control: 'text',
      description: 'id of the element that labels the dialog',
    },
    backdropClosable: {
      control: 'boolean',
      description: 'Whether clicking the backdrop closes the modal',
    },
    escClosable: {
      control: 'boolean',
      description: 'Whether pressing ESC closes the modal',
    },
    hasBackdrop: {
      control: 'boolean',
      description: 'Whether a backdrop overlay is shown',
    },
    content: {
      table: { disable: true },
    },
    label: {
      table: { disable: true },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Modal with named slots. Open via `ModalService.open(Component, config)`. Close with ESC or backdrop click. Use the Controls panel to tweak size, accessibility labels, and behavior.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ModalTrigger>;

// ===========================================================================
// Stories
// ===========================================================================

export const WithSlots: Story = {
  args: {
    label: 'Open Slot Modal',
    content: 'slots',
    size: ModalSize.MEDIUM,
    ariaLabel: 'Delete Item dialog',
    backdropClosable: true,
    escClosable: true,
    hasBackdrop: true,
  },
  render: (args) => ({
    props: args,
    template: `<story-modal-trigger ${argsToTemplate(args)}></story-modal-trigger>`,
  }),
};

export const ServiceApi: Story = {
  args: {
    label: 'Open via Service',
    content: 'service',
    size: ModalSize.MEDIUM,
    ariaLabel: 'Service API dialog',
    backdropClosable: true,
    escClosable: true,
    hasBackdrop: true,
  },
  render: (args) => ({
    props: args,
    template: `<story-modal-trigger ${argsToTemplate(args)}></story-modal-trigger>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Opened via `ModalService.open(Component)` without slots. Content has visible border and background.',
      },
    },
  },
};
