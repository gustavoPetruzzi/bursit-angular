import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

// Brand-tinted manager chrome (TC-05). The manager document is separate from the preview, so
// var(--token) cannot resolve here; the literals below are structurally required in this file
// (design.md D6). EVERY colour var Storybook's manager theme accepts is set explicitly, so no
// colour falls through to Storybook's stock palette; each literal is copied from the installed
// bursit-ui-tokens@2.0.0 light / dark layer and names the token it traces to.
//
// `create()` resolves `barSelectedColor` to `colorSecondary` when it is not set, so it is set
// here deliberately to the brand primary (maintainer decision, 2026-09-17).
//
// Radii: Storybook's API takes a unitless px number while the token layer declares rem, so the
// two values below convert --radius-md (0.5rem) and --radius-sm (0.375rem) at a 16px root.
//
// fontBase / fontCode are not colours and stay on Storybook's stacks, outside this change's scope.
const bursitLight = create({
  base: 'light',
  // Accents
  colorPrimary: '#BA3B54', // --color-primary
  colorSecondary: '#3A6B9C', // --color-secondary
  barSelectedColor: '#BA3B54', // --color-primary
  barHoverColor: '#BA3B54', // --color-primary
  appHoverBg: 'rgba(186, 59, 84, 0.15)', // --color-primary-alpha-15
  // Surfaces
  appBg: '#F9FAFB', // --color-bg
  appContentBg: '#FFFFFF', // --color-bg-elevated
  appPreviewBg: '#FFFFFF', // --color-bg-elevated
  barBg: '#FFFFFF', // --color-bg-elevated
  buttonBg: '#F9FAFB', // --color-bg
  booleanBg: '#EFF2F5', // --color-bg-sunken
  booleanSelectedBg: '#FFFFFF', // --color-bg-elevated
  inputBg: '#FFFFFF', // --input-bg
  // Text
  textColor: '#272E35', // --color-text
  textMutedColor: '#505E6D', // --color-text-muted
  barTextColor: '#505E6D', // --color-text-muted
  inputTextColor: '#272E35', // --color-text
  textInverseColor: '#FFFFFF', // --color-text-inverse
  // Borders
  appBorderColor: '#DDE3E9', // --color-border
  buttonBorder: '#647587', // --color-border-control
  inputBorder: '#647587', // --color-border-control
  // Radii (px; see the rem conversion note above)
  appBorderRadius: 8, // --radius-md
  inputBorderRadius: 6, // --radius-sm
});

const bursitDark = create({
  base: 'dark',
  colorPrimary: '#E8A1AF', // --color-primary
  colorSecondary: '#7BA3CC', // --color-secondary
  barSelectedColor: '#E8A1AF', // --color-primary
  barHoverColor: '#E8A1AF', // --color-primary
  appHoverBg: 'rgba(232, 161, 175, 0.15)', // --color-primary-alpha-15
  appBg: '#22282E', // --color-bg
  appContentBg: '#272E35', // --color-bg-elevated
  appPreviewBg: '#272E35', // --color-bg-elevated
  barBg: '#272E35', // --color-bg-elevated
  buttonBg: '#22282E', // --color-bg
  booleanBg: 'rgba(17, 20, 24, 0.6)', // --color-bg-sunken
  booleanSelectedBg: '#272E35', // --color-bg-elevated
  inputBg: '#272E35', // --input-bg
  textColor: '#F9FAFB', // --color-text
  textMutedColor: '#9AA8B6', // --color-text-muted
  barTextColor: '#9AA8B6', // --color-text-muted
  inputTextColor: '#F9FAFB', // --color-text
  textInverseColor: '#22282E', // --color-text-inverse
  appBorderColor: '#313B44', // --color-border
  buttonBorder: '#9AA8B6', // --color-border-control
  inputBorder: '#9AA8B6', // --color-border-control
  appBorderRadius: 8, // --radius-md
  inputBorderRadius: 6, // --radius-sm
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
