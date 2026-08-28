import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Checkbox } from './checkbox';
import { FormField } from '../form-field/form-field';
import { ErrorComponent } from '../error/error.component';

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

type CheckboxStoryArgs = {
  label: string;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  required: boolean;
  validationInteraction: 'default' | 'touched';
  errorMessage: string;
};

const SHARED_IMPORTS = [Checkbox, FormField, ErrorComponent, ReactiveFormsModule];

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
    required: {
      control: 'boolean',
      description: 'Whether the checkbox is required',
    },
    validationInteraction: {
      control: 'select',
      options: ['default', 'touched'],
      description:
        'When the invalid state is evaluated: immediately once invalid (default), or only after the control has been touched',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message shown inside bursit-form-field when invalid',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Boolean selection control wrapping a native `<input type="checkbox">`. Implements **ControlValueAccessor** for Reactive Forms and `ngModel`, and exposes `[(checked)]` / `[(disabled)]` two-way bindings via signals for standalone use. Also implements **FormFieldControl** for `bursit-form-field` compatibility, using its own internal projected label (no `bursitLabel` needed). Indeterminate is a view-only state: it never alters the form value.',
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

/**
 * Checkbox inside a form-field using its own internal label.
 * No bursitLabel is projected: the projected content is the accessible name.
 */
const FormFieldTemplate: Story['render'] = (args) => ({
  props: {
    ...args,
    control: new FormControl(false, [Validators.requiredTrue]),
  },
  template: `
    <bursit-form-field>
      <bursit-checkbox
        [formControl]="control"
        [required]="required"
        [validationInteraction]="validationInteraction"
      >
        {{ label }}
      </bursit-checkbox>
    </bursit-form-field>
  `,
});

/**
 * Checkbox in error state: the control is invalid (requiredTrue + unchecked)
 * and validationInteraction="default" surfaces the error immediately,
 * without requiring any user interaction.
 */
const ErrorStateTemplate: Story['render'] = (args) => ({
  props: {
    ...args,
    control: new FormControl(false, [Validators.requiredTrue]),
  },
  template: `
    <bursit-form-field>
      <bursit-checkbox
        [formControl]="control"
        [required]="required"
        [validationInteraction]="validationInteraction"
      >
        {{ label }}
      </bursit-checkbox>
      <span bursitError>{{ errorMessage }}</span>
    </bursit-form-field>
  `,
});

// ---------------------------------------------------------------------------
// ArgType helpers
// ---------------------------------------------------------------------------

const FORM_FIELD_ONLY = {
  checked: { control: { disable: true }, table: { disable: true } },
  indeterminate: { control: { disable: true }, table: { disable: true } },
  disabled: { control: { disable: true }, table: { disable: true } },
};

const STANDALONE_ONLY = {
  required: { control: { disable: true }, table: { disable: true } },
  validationInteraction: { control: { disable: true }, table: { disable: true } },
  errorMessage: { control: { disable: true }, table: { disable: true } },
};

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
    errorMessage: '',
  },
  argTypes: STANDALONE_ONLY,
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

/**
 * Checkbox inside a form-field (its intended container control).
 * The label is the checkbox's own projected content — no bursitLabel is used
 * to avoid duplicating the accessible name.
 */
export const InsideFormField: Story = {
  render: FormFieldTemplate,
  args: {
    ...Default.args,
    required: true,
    validationInteraction: 'touched',
    errorMessage: 'You must accept the terms and conditions',
  },
  argTypes: FORM_FIELD_ONLY,
};

/**
 * Error state: the control is invalid (requiredTrue + unchecked) and
 * validationInteraction="default" shows the error immediately — no
 * interaction needed. The checkbox itself gets a red border via aria-invalid.
 */
export const ErrorState: Story = {
  render: ErrorStateTemplate,
  args: {
    ...Default.args,
    required: true,
    validationInteraction: 'default',
    errorMessage: 'You must accept the terms and conditions',
  },
  argTypes: FORM_FIELD_ONLY,
};
