import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { BursitIconComponent } from './icon';

type IconStoryArgs = {
  name: 'chevron-down' | 'search' | 'x';
  size: number;
  color: string;
  strokeWidth: number;
};

const meta: Meta<IconStoryArgs> = {
  title: 'Components/Icon',
  component: BursitIconComponent,
  decorators: [
    moduleMetadata({
      imports: [BursitIconComponent],
    }),
  ],
  argTypes: {
    name: {
      control: 'select',
      options: ['chevron-down', 'search', 'x'],
      description: 'Icon name from the available set',
      defaultValue: { summary: 'search' },
    },
    size: {
      control: { type: 'number', min: 8, max: 64, step: 1 },
      description: 'Icon width and height in pixels',
      defaultValue: { summary: 16 },
    },
    color: {
      control: 'text',
      description: 'Stroke color — any valid CSS color value',
      defaultValue: { summary: 'currentColor' },
    },
    strokeWidth: {
      control: { type: 'number', min: 0.5, max: 4, step: 0.5 },
      description: 'Stroke thickness',
      defaultValue: { summary: 2 },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Thin wrapper around `@lucide/angular` icons. Provides a unified API (`name`, `size`, `color`, `strokeWidth`) so the design system controls which icon set is used and how icons are rendered.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<IconStoryArgs>;

const IconTemplate: Story['render'] = (args) => ({
  props: args,
  template: `<bursit-icon [name]="name" [size]="size" [color]="color" [strokeWidth]="strokeWidth"></bursit-icon>`,
});

export const Default: Story = {
  args: {
    name: 'search',
    size: 16,
    color: 'currentColor',
    strokeWidth: 2,
  },
  render: IconTemplate,
};

export const Sizes: Story = {
  args: {
    name: 'search',
    strokeWidth: 2,
    color: 'var(--color-primary)',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: center; gap: 20px;">
        <bursit-icon [name]="name" [size]="12" [color]="color" [strokeWidth]="strokeWidth"></bursit-icon>
        <bursit-icon [name]="name" [size]="16" [color]="color" [strokeWidth]="strokeWidth"></bursit-icon>
        <bursit-icon [name]="name" [size]="20" [color]="color" [strokeWidth]="strokeWidth"></bursit-icon>
        <bursit-icon [name]="name" [size]="24" [color]="color" [strokeWidth]="strokeWidth"></bursit-icon>
        <bursit-icon [name]="name" [size]="32" [color]="color" [strokeWidth]="strokeWidth"></bursit-icon>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Icons at 12, 16, 20, 24, and 32 pixels.',
      },
    },
  },
};

export const StrokeWidths: Story = {
  args: {
    name: 'search',
    size: 24,
    color: 'var(--color-primary)',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: center; gap: 20px;">
        <bursit-icon [name]="name" [size]="size" [color]="color" [strokeWidth]="1"></bursit-icon>
        <bursit-icon [name]="name" [size]="size" [color]="color" [strokeWidth]="2"></bursit-icon>
        <bursit-icon [name]="name" [size]="size" [color]="color" [strokeWidth]="3"></bursit-icon>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Stroke widths 1 (thin), 2 (default), and 3 (bold).',
      },
    },
  },
};

export const IconGallery: Story = {
  args: {
    size: 24,
    color: 'var(--color-primary)',
    strokeWidth: 2,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 32px;">
        <div style="text-align: center;">
          <bursit-icon name="chevron-down" [size]="size" [color]="color" [strokeWidth]="strokeWidth"></bursit-icon>
          <div style="font-size: 12px; margin-top: 4px; color: var(--color-text-muted);">chevron-down</div>
        </div>
        <div style="text-align: center;">
          <bursit-icon name="search" [size]="size" [color]="color" [strokeWidth]="strokeWidth"></bursit-icon>
          <div style="font-size: 12px; margin-top: 4px; color: var(--color-text-muted);">search</div>
        </div>
        <div style="text-align: center;">
          <bursit-icon name="x" [size]="size" [color]="color" [strokeWidth]="strokeWidth"></bursit-icon>
          <div style="font-size: 12px; margin-top: 4px; color: var(--color-text-muted);">x</div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'All available icons in the library. Names match the `ICON_MAP` keys in `icon.ts`.',
      },
    },
  },
};
