import type { Preview } from '@storybook/angular';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'system',
      attributeName: 'bursit-theme',
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
