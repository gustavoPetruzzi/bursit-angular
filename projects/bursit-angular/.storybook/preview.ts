import type { Preview } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { importProvidersFrom } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [importProvidersFrom(OverlayModule)],
    }),
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
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
