import { addons } from 'storybook/manager-api';
import { themes } from 'storybook/theming/create';

addons.register('bursit-theme-manager', (api) => {
  // Set initial theme
  const channel = addons.getChannel();
  let currentThemeMode = 'system';

  function applyTheme() {
    const isDark =
      currentThemeMode === 'dark' ||
      (currentThemeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    addons.setConfig({ theme: isDark ? themes.dark : themes.light });
  }

  // Apply initial theme
  applyTheme();

  // Listen for theme changes from the @storybook/addon-themes toolbar
  channel.on('globalsUpdated', ({ globals }: { globals: Record<string, unknown> }) => {
    const theme = globals['theme'] as string | undefined;
    if (theme && theme !== currentThemeMode) {
      currentThemeMode = theme;
      applyTheme();
    }
  });

  // Handle OS preference changes when in system mode
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentThemeMode === 'system') {
      applyTheme();
    }
  });
});
