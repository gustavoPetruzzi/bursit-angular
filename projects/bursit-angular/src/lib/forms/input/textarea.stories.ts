import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputDirective } from './input.directive';
import { FormField } from '../form-field/form-field';
import { LabelDirective } from '../label/label.directive';
import { ErrorComponent } from '../error/error.component';
import { MessageComponent } from '../message/message.component';

type TextareaStoryArgs = {
  placeholder?: string;
  value?: string;
  label?: string;
  floatingLabel?: boolean;
  validationInteraction?: 'default' | 'touched';
  required?: boolean;
  disabled?: boolean;
  rows?: number;
};

const meta: Meta<TextareaStoryArgs> = {
  title: 'Directives/Textarea',
  component: InputDirective,
  decorators: [
    moduleMetadata({
      imports: [InputDirective, FormField, LabelDirective, ErrorComponent, MessageComponent, ReactiveFormsModule],
    }),
  ],
  argTypes: {
    rows: {
      control: { type: 'number', min: 2, max: 10 },
      description: 'Number of visible text lines',
      defaultValue: { summary: 3 },
    },
    floatingLabel: {
      control: 'boolean',
      description: 'Whether the label floats above the textarea on focus or when filled',
      defaultValue: { summary: false },
    },
    validationInteraction: {
      control: 'select',
      options: ['default', 'touched'],
      description: 'When to show validation errors',
      defaultValue: { summary: 'default' },
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
      defaultValue: { summary: false },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
      defaultValue: { summary: false },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
      defaultValue: { summary: '' },
    },
    label: {
      control: 'text',
      description: 'Label text shown inside bursit-form-field',
      defaultValue: { summary: '' },
    },
    value: {
      control: 'text',
      description: 'Pre-filled value',
      defaultValue: { summary: '' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The InputDirective used on a native textarea element with bursit-form-field integration. Tracks focus, hover, value, disabled, and validation states.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<TextareaStoryArgs>;

// --- Templates ---

const StandaloneTemplate: Story['render'] = (args) => ({
  props: args,
  template: `<textarea bursitInput [disabled]="disabled" [required]="required" [validationInteraction]="validationInteraction" [rows]="rows" [placeholder]="placeholder">Textarea content</textarea>`,
});

const FormFieldTemplate: Story['render'] = (args) => ({
  props: {
    ...args,
    control: new FormControl({ value: args.value || '', disabled: args.disabled ?? false }),
  },
  template: `
    <bursit-form-field>
      <label bursitLabel>{{label || 'Label'}}</label>
      <textarea bursitInput [formControl]="control" [required]="required" [validationInteraction]="validationInteraction" [floatingLabel]="floatingLabel" [rows]="rows" [placeholder]="placeholder"></textarea>
    </bursit-form-field>
  `,
});

const FormFieldRequiredTemplate: Story['render'] = (args) => ({
  props: {
    ...args,
    control: new FormControl(
      { value: args.value || '', disabled: args.disabled ?? false },
      [Validators.required],
    ),
  },
  template: `
    <bursit-form-field>
      <label bursitLabel>{{label || 'Label'}}</label>
      <textarea bursitInput [formControl]="control" [required]="required" [validationInteraction]="validationInteraction" [floatingLabel]="floatingLabel" [rows]="rows" [placeholder]="placeholder"></textarea>
    </bursit-form-field>
  `,
});

// --- Stories ---

export const Default: Story = {
  args: {
    placeholder: 'Write something...',
    rows: 3,
    disabled: false,
    value: '',
  },
  render: StandaloneTemplate,
};

export const InsideFormField: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a description',
    rows: 4,
    required: false,
  },
  render: FormFieldTemplate,
};

export const InsideFormFieldWithValue: Story = {
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself',
    rows: 4,
    value: 'Angular developer passionate about design systems and accessible components.',
    required: false,
  },
  render: FormFieldTemplate,
};

export const Required: Story = {
  args: {
    label: 'Feedback',
    placeholder: 'Your feedback is required',
    rows: 5,
    required: true,
  },
  render: FormFieldRequiredTemplate,
};

export const ErrorState: Story = {
  args: {
    label: 'Feedback',
    placeholder: 'Your feedback is required',
    rows: 4,
    required: true,
    value: '',
  },
  render: (args) => ({
    props: {
      ...args,
      control: (() => {
        const ctrl = new FormControl('', [Validators.required, Validators.minLength(10)]);
        ctrl.markAsTouched();
        ctrl.markAsDirty();
        return ctrl;
      })(),
    },
    template: `
      <bursit-form-field>
        <label bursitLabel>{{label || 'Feedback'}}</label>
        <textarea bursitInput [formControl]="control" [required]="required" [validationInteraction]="validationInteraction" [rows]="rows" [placeholder]="placeholder"></textarea>
        <span bursitError>Feedback must be at least 10 characters</span>
      </bursit-form-field>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Error state: FormControl with Validators.required + Validators.minLength(10), marked as touched and dirty.',
      },
    },
  },
};

export const ValidationInteractionTouched: Story = {
  args: {
    label: 'Feedback',
    placeholder: 'Your feedback is required',
    rows: 4,
    required: true,
    validationInteraction: 'touched',
    value: '',
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl('', [Validators.required]),
    },
    template: `
      <bursit-form-field>
        <label bursitLabel>{{label || 'Feedback'}}</label>
        <textarea bursitInput [formControl]="control" [required]="required" validationInteraction="touched" [rows]="rows" [placeholder]="placeholder"></textarea>
        <span bursitError>This field is required</span>
      </bursit-form-field>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'With validationInteraction=touched, the error is only shown after the user has interacted with the field. Focus and blur the textarea to see the state change.',
      },
    },
  },
};

export const WithMessage: Story = {
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself',
    rows: 3,
    value: '',
    required: false,
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl(args.value || ''),
    },
    template: `
      <bursit-form-field>
        <label bursitLabel>{{label || 'Bio'}}</label>
        <textarea bursitInput [formControl]="control" [rows]="rows" [placeholder]="placeholder"></textarea>
        <span bursitMessage>Max 500 characters. Markdown is supported.</span>
      </bursit-form-field>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    label: 'Read-only info',
    placeholder: 'This field is disabled',
    rows: 4,
    disabled: true,
    value: 'This content cannot be edited.',
  },
  render: FormFieldTemplate,
};

export const FloatingLabel: Story = {
  args: {
    label: 'Comments',
    placeholder: 'Add your comments',
    rows: 3,
    floatingLabel: true,
    value: '',
    required: false,
  },
  render: FormFieldTemplate,
  parameters: {
    docs: {
      description: {
        story:
          'Floating label variant: the label sits inside the textarea and floats up on focus or when filled.',
      },
    },
  },
};

export const Playground: Story = {
  args: {
    label: 'Label',
    placeholder: 'Write something...',
    rows: 4,
    required: false,
    disabled: false,
    floatingLabel: false,
    value: '',
  },
  render: FormFieldTemplate,
  parameters: {
    docs: {
      description: {
        story: 'Use the controls below to try out different textarea states.',
      },
    },
  },
};
