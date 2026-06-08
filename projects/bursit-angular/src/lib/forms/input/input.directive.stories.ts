import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputDirective } from './input.directive';
import { FormField } from '../form-field/form-field';
import { LabelDirective } from '../label/label.directive';

type InputStoryArgs = InputDirective & {
  placeholder?: string;
  value?: string;
  label?: string;
};

const meta: Meta<InputStoryArgs> = {
  title: 'Directives/Input',
  component: InputDirective,
  decorators: [
    moduleMetadata({
      imports: [InputDirective, FormField, LabelDirective, ReactiveFormsModule],
    }),
  ],
  argTypes: {
    floatingLabel: {
      control: 'boolean',
      description: 'Whether the label floats above the input on focus or when filled',
      defaultValue: {
        summary: false,
      },
    },
    validationInteraction: {
      control: 'select',
      options: ['default', 'touched'],
      description:
        'When to show validation errors (default immediately, touched only after user interaction)',
      defaultValue: {
        summary: 'default',
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
      defaultValue: {
        summary: false,
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
      defaultValue: {
        summary: false,
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
      defaultValue: {
        summary: '',
      },
    },
    label: {
      control: 'text',
      description: 'Label text shown inside bursit-form-field',
      defaultValue: {
        summary: '',
      },
    },
    value: {
      control: 'text',
      description: 'Pre-filled value for the input',
      defaultValue: {
        summary: '',
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Attribute directive that enhances a native input element with Bursit form-field integration. Tracks focus, hover, value, disabled, and validation states for use within bursit-form-field.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<InputStoryArgs>;

// --- Templates ---

/**
 * Standalone input without a form-field wrapper.
 */
const StandaloneTemplate: Story['render'] = (args) => ({
  props: args,
  template: `<input bursitInput [disabled]="disabled" [required]="required" [validationInteraction]="validationInteraction" [value]="value" [placeholder]="placeholder" />`,
});

/**
 * Input wrapped inside bursit-form-field with a label.
 * The FormControl is wired to the input via [formControl] so the directive
 * can track value, disabled, and validation state through NgControl.
 */
const FormFieldTemplate: Story['render'] = (args) => ({
  props: {
    ...args,
    control: new FormControl(args.value || ''),
  },
  template: `
    <bursit-form-field>
      <label bursitLabel>{{label || 'Label'}}</label>
      <input bursitInput [formControl]="control" [required]="required" [validationInteraction]="validationInteraction" [floatingLabel]="floatingLabel" [placeholder]="placeholder" />
    </bursit-form-field>
  `,
});

/**
 * Form-field with required Angular validator on the FormControl.
 * The [required] binding on the directive sets the visual required indicator,
 * while Validators.required on the FormControl drives the invalid state.
 */
const FormFieldRequiredTemplate: Story['render'] = (args) => ({
  props: {
    ...args,
    control: new FormControl(args.value || '', [Validators.required]),
  },
  template: `
    <bursit-form-field>
      <label bursitLabel>{{label || 'Label'}}</label>
      <input bursitInput [formControl]="control" [required]="required" [validationInteraction]="validationInteraction" [floatingLabel]="floatingLabel" [placeholder]="placeholder" />
    </bursit-form-field>
  `,
});

// --- Stories ---

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    disabled: false,
    required: false,
  },
  render: StandaloneTemplate,
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    required: false,
  },
  render: StandaloneTemplate,
};

export const InsideFormField: Story = {
  args: {
    label: 'Name',
    placeholder: 'Enter your name',
    required: false,
  },
  render: FormFieldTemplate,
};

export const InsideFormFieldDisabled: Story = {
  args: {
    label: 'Name',
    placeholder: 'Disabled inside form-field',
    disabled: true,
    required: false,
  },
  render: FormFieldTemplate,
};

export const InsideFormFieldWithValue: Story = {
  args: {
    label: 'Name',
    placeholder: 'Enter your name',
    value: 'John Doe',
    required: false,
  },
  render: FormFieldTemplate,
};

export const InsideFormFieldRequired: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    required: true,
  },
  render: FormFieldRequiredTemplate,
};

export const Playground: Story = {
  args: {
    label: 'Label',
    placeholder: 'Enter text...',
    required: false,
    disabled: false,
    validationInteraction: 'default',
    floatingLabel: false,
    value: '',
  },
  render: FormFieldTemplate,
  parameters: {
    docs: {
      description: {
        story: 'Use the controls below to try out the different input states.',
      },
    },
  },
};
