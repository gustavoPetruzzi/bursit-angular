# Bursit Angular

UI component library for Angular 21, built on **directives** over native HTML elements. Uses [bursit-ui-tokens](https://github.com/gustavoPetruzzi/bursit-ui-tokens) as its design system via CSS custom properties.

## Installation

```bash
ng add bursit-angular
```

This installs the library and configures the design tokens in `angular.json`.

## Components and Directives

| Name                 | Type        | Selector            | Description                                                              |
| -------------------- | ----------- | ------------------- | ------------------------------------------------------------------------ |
| `ButtonDirective`    | Directive   | `[bursitButton]`    | Buttons with variants: primary, secondary, outline, link, danger         |
| `InputDirective`     | Directive   | `[bursitInput]`     | Input with reactive states (focus, error, disabled, floating label)      |
| `LabelDirective`     | Directive   | `[bursitLabel]`     | Label integrated with `FormField`                                        |
| `FormField`          | Component   | `bursit-form-field` | Form container with slots for label, control, error, and helper          |
| `BursitThemeService` | Service     | (root)              | Theme handling: light, dark, system. Persists in localStorage            |

### Button

```html
<button bursitButton color="primary">Primary</button>
<button bursitButton color="secondary" size="large">Large Secondary</button>
<button bursitButton color="outline">Outline</button>
<button bursitButton color="link">Link</button>
<button bursitButton color="danger">Danger</button>
```

### Form Field

```html
<bursit-form-field>
  <label bursitLabel>Email</label>
  <input bursitInput [formControl]="emailControl" required floatingLabel />
  <span bursit-error>Invalid email</span>
  <span bursit-message>Enter your email address</span>
</bursit-form-field>
```

### Theme

```typescript
import { BursitThemeService } from 'bursit-angular';

theme = inject(BursitThemeService);

// Change theme
theme.setTheme('dark'); // 'light' | 'dark' | 'system'

// Toggle
theme.toggle();

// Reactive signals
theme.mode; // Signal<ThemeMode>
theme.effectiveTheme; // Signal<'light' | 'dark'>
```

The theme is applied automatically via the `bursit-theme` attribute on `<html>` and persists in localStorage.

## Architecture

- **Directive-first**: The primitives are directives over native elements (`<button>`, `<input>`). This preserves native accessibility and behavior.
- **Standalone**: All components and directives are standalone. No `NgModule` required.
- **Design tokens**: All visual styling comes from `bursit-ui-tokens` via `var()`. The library only provides structural CSS (layout, states).
- **Content projection**: `FormField` uses projection slots for label, control, error, and helper.

## Development

```bash
npm install
npm run storybook      # Storybook at http://localhost:6006
npm run test           # Tests with Jest
npm run test:coverage  # Tests + coverage (80% threshold)
npm run build          # Library + schematics build
```

## Project structure

```
projects/bursit-angular/
├── src/
│   ├── lib/
│   │   ├── button/     # ButtonDirective
│   │   ├── forms/      # FormField, InputDirective, LabelDirective
│   │   └── theme/      # BursitThemeService
│   ├── styles/         # Structural SCSS (_button.scss, etc.)
│   └── public-api.ts   # Public API
├── schematics/         # ng-add schematic
└── .storybook/         # Storybook configuration
```