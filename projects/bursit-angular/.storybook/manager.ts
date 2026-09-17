import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

// Brand-tinted manager chrome (TC-05). The manager document is separate from the preview, so
// var(--token) cannot resolve here; the literals below mirror the brand tokens and are
// structurally required in this file (design.md D6).
const bursitLight = create({
  base: 'light',
  colorPrimary: '#BA3B54',
  colorSecondary: '#3A6B9C',
  appBg: '#F9FAFB',
  appContentBg: '#FFFFFF',
  textColor: '#272E35',
  textMutedColor: '#505E6D',
  appBorderColor: '#DDE3E9',
  inputBorder: '#647587',
});

const bursitDark = create({
  base: 'dark',
  colorPrimary: '#E8A1AF',
  colorSecondary: '#7BA3CC',
  appBg: '#22282E',
  appContentBg: '#272E35',
  textColor: '#F9FAFB',
  textMutedColor: '#9AA8B6',
  appBorderColor: '#313B44',
  inputBorder: '#9AA8B6',
});

addons.register('bursit-theme-manager', (api) => {
  // Set initial theme
  const channel = addons.getChannel();
  let currentThemeMode = 'system';

  function applyTheme() {
    const isDark =
      currentThemeMode === 'dark' ||
      (currentThemeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    addons.setConfig({ theme: isDark ? bursitDark : bursitLight });
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
