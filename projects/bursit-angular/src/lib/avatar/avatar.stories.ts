import { Meta, StoryObj } from '@storybook/angular';
import { Avatar } from './avatar';

type AvatarStoryArgs = {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  src: string | null;
  userName: string;
};

const meta: Meta<AvatarStoryArgs> = {
  title: 'Components/Avatar',
  component: Avatar,
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Avatar size variant',
    },
    src: {
      control: 'text',
      description: 'Image URL. When empty or null, initials are shown instead.',
    },
    userName: {
      control: 'text',
      description: 'User name used to generate initials when no image is provided.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Displays a user avatar. Renders an image when `src` is provided, otherwise shows generated initials from the user name. Supports six sizes: xs, sm, md, lg, xl, and 2xl.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<AvatarStoryArgs>;

export const ExtraSmall: Story = {
  args: {
    size: 'xs',
    src: null,
    userName: 'John Doe',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    src: null,
    userName: 'John Doe',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    src: null,
    userName: 'John Doe',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    src: null,
    userName: 'John Doe',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    src: null,
    userName: 'John Doe',
  },
};

export const TwoXL: Story = {
  args: {
    size: '2xl',
    src: null,
    userName: 'John Doe',
  },
};

export const WithImage: Story = {
  args: {
    size: 'md',
    src: '/avatar-placeholder.jpg',
    userName: 'John Doe',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Requires an image at `.storybook/public/avatar-placeholder.png`. Drop any PNG there and restart Storybook.',
      },
    },
  },
};

export const LongName: Story = {
  args: {
    size: 'md',
    src: null,
    userName: 'John Michael Doe',
  },
};

export const SingleName: Story = {
  args: {
    size: 'md',
    src: null,
    userName: 'John',
  },
};

export const Playground: Story = {
  args: {
    size: 'md',
    src: null,
    userName: 'John Doe',
  },
  parameters: {
    docs: {
      description: {
        story: 'Use the controls below to try out different avatar configurations.',
      },
    },
  },
};
