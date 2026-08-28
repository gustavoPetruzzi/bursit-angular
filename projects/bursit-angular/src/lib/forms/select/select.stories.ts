import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from './select';
import { Option } from '../option/option';
import { FormField } from '../form-field/form-field';
import { LabelDirective } from '../label/label.directive';
import { ErrorComponent } from '../error/error.component';
import { MessageComponent } from '../message/message.component';

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

type SelectStoryArgs = {
  placeholder: string;
  label: string;
  floatingLabel: boolean;
  required: boolean;
  disabled: boolean;
};

const SHARED_IMPORTS = [
  Select,
  Option,
  FormField,
  LabelDirective,
  ErrorComponent,
  MessageComponent,
  ReactiveFormsModule,
];

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<SelectStoryArgs> = {
  title: 'Components/Select',
  component: Select,
  decorators: [moduleMetadata({ imports: SHARED_IMPORTS })],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when no option is selected',
    },
    label: {
      control: 'text',
      description: 'Label text inside bursit-form-field',
    },
    floatingLabel: {
      control: 'boolean',
      description: 'Whether the label floats above on focus or when filled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the select is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Single-select form control built with CDK Overlay. Implements **ControlValueAccessor** for Reactive Forms and `ngModel`, and **FormFieldControl** for `bursit-form-field` compatibility. Options are projected via `bursit-option` and communicate via DI (`BURSIT_SELECT` token).',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<SelectStoryArgs>;

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/**
 * Standalone select with four hardcoded options.
 */
const StandaloneTemplate: Story['render'] = (args) => ({
  props: {
    ...args,
    control: new FormControl({ value: null, disabled: args.disabled }),
  },
  template: `
    <bursit-select
      [formControl]="control"
      [placeholder]="placeholder"
      [required]="required"
    >
      <bursit-option value="apple">Apple</bursit-option>
      <bursit-option value="banana">Banana</bursit-option>
      <bursit-option value="cherry">Cherry</bursit-option>
      <bursit-option value="date">Date</bursit-option>
    </bursit-select>
  `,
});

/**
 * Select wrapped in bursit-form-field with a label and options.
 */
const FormFieldTemplate: Story['render'] = (args) => ({
  props: {
    ...args,
    control: new FormControl({ value: null, disabled: args.disabled }),
  },
  template: `
    <bursit-form-field>
      <label bursitLabel>{{ label }}</label>
      <bursit-select
        [formControl]="control"
        [placeholder]="placeholder"
        [required]="required"
        [floatingLabel]="floatingLabel"
      >
        <bursit-option value="apple">Apple</bursit-option>
        <bursit-option value="banana">Banana</bursit-option>
        <bursit-option value="cherry">Cherry</bursit-option>
        <bursit-option value="date">Date</bursit-option>
      </bursit-select>
    </bursit-form-field>
  `,
});

/**
 * Select with one option pre-selected on mount.
 */
const PreSelectedTemplate: Story['render'] = (args) => ({
  props: {
    ...args,
    control: new FormControl({ value: 'banana', disabled: args.disabled }),
  },
  template: `
    <bursit-form-field>
      <label bursitLabel>{{ label }}</label>
      <bursit-select
        [formControl]="control"
        [placeholder]="placeholder"
        [required]="required"
        [floatingLabel]="floatingLabel"
      >
        <bursit-option value="apple">Apple</bursit-option>
        <bursit-option value="banana">Banana</bursit-option>
        <bursit-option value="cherry">Cherry</bursit-option>
        <bursit-option value="date">Date</bursit-option>
      </bursit-select>
    </bursit-form-field>
  `,
});

// ---------------------------------------------------------------------------
// ArgType helpers
// ---------------------------------------------------------------------------

const WITHOUT_LABEL = {
  floatingLabel: { control: { disable: true }, table: { disable: true } },
  label: { control: { disable: true }, table: { disable: true } },
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Basic standalone select with four fruit options.
 * Click the trigger to open the dropdown, click an option to select it.
 */
export const Default: Story = {
  args: {
    placeholder: 'Pick a fruit',
    disabled: false,
    required: false,
    label: '',
    floatingLabel: false,
  },
  render: StandaloneTemplate,
  argTypes: WITHOUT_LABEL,
};

/**
 * Disabled select — the trigger is non-interactive and options cannot be opened.
 */
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled select',
    disabled: true,
    required: false,
    label: '',
    floatingLabel: false,
  },
  render: StandaloneTemplate,
  argTypes: WITHOUT_LABEL,
};

/**
 * Select inside a form-field with a label.
 * The label stays above the trigger in the default (non-floating) layout.
 */
export const InsideFormField: Story = {
  args: {
    label: 'Country',
    placeholder: 'Select your country',
    required: false,
    floatingLabel: false,
    disabled: false,
  },
  render: FormFieldTemplate,
};

/**
 * Select with a value pre-selected via FormControl.
 * The trigger shows the selected value and hasValue is true.
 */
export const PreSelected: Story = {
  args: {
    label: 'Fruit',
    placeholder: 'Pick a fruit',
    required: false,
    floatingLabel: false,
    disabled: false,
  },
  render: PreSelectedTemplate,
};

/**
 * Required select inside a form-field.
 * Validates on blur — shows error state when empty and touched.
 */
export const Required: Story = {
  render: () => ({
    props: {
      control: new FormControl(null, Validators.required),
    },
    moduleMetadata: { imports: SHARED_IMPORTS },
    template: `
      <bursit-form-field>
        <label bursitLabel>Email</label>
        <bursit-select
          [formControl]="control"
          placeholder="Select your email"
          [required]="true"
        >
          <bursit-option value="primary">primary&#64;example.com</bursit-option>
          <bursit-option value="work">work&#64;example.com</bursit-option>
          <bursit-option value="personal">personal&#64;example.com</bursit-option>
        </bursit-select>
        @if (control.invalid && control.touched) {
          <span bursitError>This field is required</span>
        }
      </bursit-form-field>
    `,
  }),
};

/**
 * Floating label variant — the label sits inside the trigger area
 * and floats up when a value is selected or the field is focused.
 */
export const FloatingLabel: Story = {
  args: {
    label: 'Fruit',
    placeholder: 'Pick a fruit',
    floatingLabel: true,
    required: false,
    disabled: false,
  },
  render: FormFieldTemplate,
};

/**
 * Select with some options marked as disabled.
 * Disabled options cannot be clicked or navigated to via keyboard.
 */
export const WithDisabledOptions: Story = {
  args: {
    label: 'Plan',
    placeholder: 'Choose a plan',
    required: false,
    floatingLabel: false,
    disabled: false,
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl(null),
    },
    template: `
      <bursit-form-field>
        <label bursitLabel>{{ label }}</label>
        <bursit-select
          [formControl]="control"
          [placeholder]="placeholder"
        >
          <bursit-option value="free">Free</bursit-option>
          <bursit-option value="pro">Pro</bursit-option>
          <bursit-option value="enterprise" [disabled]="true">Enterprise — unavailable</bursit-option>
        </bursit-select>
      </bursit-form-field>
    `,
  }),
};

/**
 * Long list of options — validates that the panel scrolls correctly
 * and that keyboard navigation wraps properly through all items.
 */
export const LongList: Story = {
  args: {
    label: 'Timezone',
    placeholder: 'Select timezone',
    required: false,
    floatingLabel: false,
    disabled: false,
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl(null),
    },
    template: `
      <bursit-form-field>
        <label bursitLabel>{{ label }}</label>
        <bursit-select
          [formControl]="control"
          [placeholder]="placeholder"
        >
          <bursit-option value="Pacific/Midway">Pacific/Midway (UTC-11)</bursit-option>
          <bursit-option value="Pacific/Honolulu">Pacific/Honolulu (UTC-10)</bursit-option>
          <bursit-option value="America/Anchorage">America/Anchorage (UTC-9)</bursit-option>
          <bursit-option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</bursit-option>
          <bursit-option value="America/Denver">America/Denver (UTC-7)</bursit-option>
          <bursit-option value="America/Chicago">America/Chicago (UTC-6)</bursit-option>
          <bursit-option value="America/New_York">America/New_York (UTC-5)</bursit-option>
          <bursit-option value="America/Sao_Paulo">America/Sao_Paulo (UTC-3)</bursit-option>
          <bursit-option value="Europe/London">Europe/London (UTC+0)</bursit-option>
          <bursit-option value="Europe/Paris">Europe/Paris (UTC+1)</bursit-option>
          <bursit-option value="Europe/Moscow">Europe/Moscow (UTC+3)</bursit-option>
          <bursit-option value="Asia/Dubai">Asia/Dubai (UTC+4)</bursit-option>
          <bursit-option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</bursit-option>
          <bursit-option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</bursit-option>
          <bursit-option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</bursit-option>
          <bursit-option value="Pacific/Auckland">Pacific/Auckland (UTC+12)</bursit-option>
        </bursit-select>
      </bursit-form-field>
    `,
  }),
};

/**
 * Interactive playground with all controls exposed.
 * Toggle disabled, required, floatingLabel, and the label text.
 */
export const Playground: Story = {
  args: {
    label: 'Label',
    placeholder: 'Select an option...',
    required: false,
    disabled: false,
    floatingLabel: false,
  },
  render: FormFieldTemplate,
};
