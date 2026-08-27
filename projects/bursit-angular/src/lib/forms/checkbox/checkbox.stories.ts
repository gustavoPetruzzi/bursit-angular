import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { Checkbox } from './checkbox';

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

type CheckboxStoryArgs = {
  label: string;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
};

const SHARED_IMPORTS = [Checkbox];

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<CheckboxStoryArgs> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  decorators: [moduleMetadata({ imports: SHARED_IMPORTS })],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text projected inside the checkbox',
    },
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Visual-only mixed state (e.g., "select all" parent). Never changes the form value',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Boolean selection control wrapping a native `<input type="checkbox">`. Implements **ControlValueAccessor** for Reactive Forms and `ngModel`, and exposes `[(checked)]` / `[(disabled)]` two-way bindings via signals for standalone use. The label is projected as content and associated with the input natively. Indeterminate is a view-only state: it never alters the form value.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<CheckboxStoryArgs>;

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/**
 * Standalone checkbox using two-way binding.
 */
const StandaloneTemplate: Story['render'] = (args) => ({
  props: {
    ...args,
  },
  template: `
    <bursit-checkbox
      [(checked)]="checked"
      [(disabled)]="disabled"
      [indeterminate]="indeterminate"
    >
      {{ label }}
    </bursit-checkbox>
  `,
});

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: StandaloneTemplate,
  args: {
    label: 'Accept terms and conditions',
    checked: false,
    indeterminate: false,
    disabled: false,
  },
};

export const Checked: Story = {
  render: StandaloneTemplate,
  args: {
    ...Default.args,
    checked: true,
  },
};

export const Disabled: Story = {
  render: StandaloneTemplate,
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  render: StandaloneTemplate,
  args: {
    ...Default.args,
    checked: true,
    disabled: true,
  },
};

export const Indeterminate: Story = {
  render: StandaloneTemplate,
  args: {
    ...Default.args,
    indeterminate: true,
  },
};

export const Playground: Story = {
  render: StandaloneTemplate,
  args: {
    ...Default.args,
  },
};
