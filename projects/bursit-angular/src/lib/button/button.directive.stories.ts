import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { ButtonDirective } from './button.directive';
import { ButtonColor } from './models/button-color.type';

type ButtonStoryArgs = { color?: ButtonColor; size?: 'small' | 'medium' | 'large' };

const meta: Meta<ButtonStoryArgs> = {
  title: 'Directives/Button',
  component: ButtonDirective,
  decorators: [
    moduleMetadata({
      imports: [ButtonDirective],
    }),
  ],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'link', 'danger'] as ButtonColor[],
      description: 'Button color variant',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large', 'fluid'],
      description: 'Button size (HTML attribute)',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Attribute directive that styles a native button with the Bursit design system variants.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<ButtonStoryArgs>;

// Helper function for the template since it's a directive applied to a button element
const Template = (args: ButtonStoryArgs) => ({
  props: args,
  template: `<button bursitButton [color]="color" [attr.size]="size">Example button</button>`,
});

export const Primary: Story = {
  args: {
    color: 'primary',
    size: 'medium',
  },
  render: Template,
};

export const Secondary: Story = {
  args: {
    color: 'secondary',
    size: 'medium',
  },
  render: Template,
};

export const Outline: Story = {
  args: {
    color: 'outline',
    size: 'medium',
  },
  render: Template,
};

export const Link: Story = {
  args: {
    color: 'link',
    size: 'medium',
  },
  render: Template,
};

export const Danger: Story = {
  args: {
    color: 'danger',
    size: 'medium',
  },
  render: Template,
};

// Story with interactive controls
export const Playground: Story = {
  args: {
    color: 'primary',
    size: 'medium',
  },
  render: Template,
  parameters: {
    docs: {
      description: {
        story: 'Use the controls below to try out the different button variants.',
      },
    },
  },
};
