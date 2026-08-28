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
  validationInteraction: 'default' | 'touched';
  disabled: boolean;
  ariaLabel: string;
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
    validationInteraction: {
      control: 'select',
      options: ['default', 'touched'],
      description:
        'When to show validation errors (default immediately, touched only after user interaction)',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name for the trigger when used without a form-field label',
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
      [ariaLabel]="ariaLabel"
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
 * Required select inside a form-field. The control is invalid until a value is
 * chosen; validationInteraction decides whether the error appears immediately
 * (default) or only after the user has interacted with the field (touched).
 */
const InsideFormFieldTemplate: Story['render'] = (args) => ({
  props: {
    ...args,
    control: new FormControl(null, Validators.required),
  },
  template: `
    <bursit-form-field>
      <label bursitLabel>{{ label }}</label>
      <bursit-select
        [formControl]="control"
        [placeholder]="placeholder"
        [required]="true"
        [validationInteraction]="validationInteraction"
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

const WITHOUT_REQUIRED_INTERACTION = {
  required: { control: { disable: true }, table: { disable: true } },
  validationInteraction: { control: { disable: true }, table: { disable: true } },
};

const WITHOUT_LABEL_AND_REQUIRED_INTERACTION = {
  ...WITHOUT_LABEL,
  ...WITHOUT_REQUIRED_INTERACTION,
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
    label: '',
    floatingLabel: false,
    ariaLabel: 'Pick a fruit',
  },
  render: StandaloneTemplate,
  argTypes: WITHOUT_LABEL_AND_REQUIRED_INTERACTION,
};

/**
 * Disabled select — the trigger is non-interactive and options cannot be opened.
 */
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled select',
    disabled: true,
    label: '',
    floatingLabel: false,
    ariaLabel: 'Disabled select',
  },
  render: StandaloneTemplate,
  argTypes: WITHOUT_LABEL_AND_REQUIRED_INTERACTION,
};

/**
 * Required select inside a form-field with a label.
 * The label stays above the trigger in the default (non-floating) layout.
 * Switch validationInteraction between 'touched' (error after interaction)
 * and 'default' (error immediately) to see the state change.
 */
export const InsideFormField: Story = {
  args: {
    label: 'Country',
    placeholder: 'Select your country',
    required: true,
    validationInteraction: 'touched',
    floatingLabel: false,
    disabled: false,
  },
  render: InsideFormFieldTemplate,
};

/**
 * Select with a value pre-selected via FormControl.
 * The trigger shows the selected value and hasValue is true.
 */
export const PreSelected: Story = {
  args: {
    label: 'Fruit',
    placeholder: 'Pick a fruit',
    floatingLabel: false,
    disabled: false,
  },
  render: PreSelectedTemplate,
  argTypes: WITHOUT_REQUIRED_INTERACTION,
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
    disabled: false,
  },
  render: FormFieldTemplate,
  argTypes: WITHOUT_REQUIRED_INTERACTION,
};

/**
 * Select with some options marked as disabled.
 * Disabled options cannot be clicked or navigated to via keyboard.
 */
export const WithDisabledOptions: Story = {
  args: {
    label: 'Plan',
    placeholder: 'Choose a plan',
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
  argTypes: WITHOUT_REQUIRED_INTERACTION,
};

/**
 * Long list of options — validates that the panel scrolls correctly
 * and that keyboard navigation wraps properly through all items.
 */
export const LongList: Story = {
  args: {
    label: 'Timezone',
    placeholder: 'Select timezone',
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
  argTypes: WITHOUT_REQUIRED_INTERACTION,
};

/**
 * Select with no options rendered.
 * The trigger renders and can be opened, but the empty listbox shows nothing
 * and keyboard navigation is a safe no-op.
 */
export const ZeroOptions: Story = {
  args: {
    placeholder: 'No options available',
    disabled: false,
    label: '',
    floatingLabel: false,
    ariaLabel: 'No options available',
  },
  render: () => ({
    props: {
      control: new FormControl(null),
    },
    template: `
      <bursit-select
        [formControl]="control"
        placeholder="No options available"
        ariaLabel="No options available"
      >
      </bursit-select>
    `,
  }),
  argTypes: WITHOUT_LABEL_AND_REQUIRED_INTERACTION,
};

/**
 * Select with exactly one option.
 * Useful for validating that keyboard navigation does not loop or error
 * when there is a single list item.
 */
export const OneOption: Story = {
  args: {
    placeholder: 'Pick a fruit',
    disabled: false,
    label: '',
    floatingLabel: false,
    ariaLabel: 'Pick a fruit',
  },
  render: () => ({
    props: {
      control: new FormControl(null),
    },
    template: `
      <bursit-select
        [formControl]="control"
        placeholder="Pick a fruit"
        ariaLabel="Pick a fruit"
      >
        <bursit-option value="apple">Apple</bursit-option>
      </bursit-select>
    `,
  }),
  argTypes: WITHOUT_LABEL_AND_REQUIRED_INTERACTION,
};

/**
 * Interactive playground with all controls exposed.
 * Toggle disabled, floatingLabel, and the label text.
 */
export const Playground: Story = {
  args: {
    label: 'Label',
    placeholder: 'Select an option...',
    disabled: false,
    floatingLabel: false,
  },
  render: FormFieldTemplate,
  argTypes: WITHOUT_REQUIRED_INTERACTION,
};
