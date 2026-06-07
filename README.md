# Bursit Angular

Librería de componentes UI para Angular 21, basada en **directivas** sobre elementos HTML nativos. Usa [bursit-ui-tokens](https://github.com/gustavoPetruzzi/bursit-ui-tokens) como sistema de diseño mediante CSS custom properties.

## Instalación

```bash
ng add bursit-angular
```

Esto agrega la librería y configura los tokens de diseño en `angular.json`.

## Componentes y Directivas

| Nombre               | Tipo       | Selector            | Descripción                                                            |
| -------------------- | ---------- | ------------------- | ---------------------------------------------------------------------- |
| `ButtonDirective`    | Directiva  | `[bursitButton]`    | Botones con variantes: primary, secondary, outline, link, danger       |
| `InputDirective`     | Directiva  | `[bursitInput]`     | Input con estados reactivos (focus, error, disabled, floating label)   |
| `LabelDirective`     | Directiva  | `[bursitLabel]`     | Label integrado con `FormField`                                        |
| `FormField`          | Componente | `bursit-form-field` | Contenedor de formulario con slots para label, control, error y helper |
| `BursitThemeService` | Servicio   | (root)              | Manejo de tema: light, dark, system. Persiste en localStorage          |

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
  <span bursit-error>Email inválido</span>
  <span bursit-message>Ingresá tu dirección de correo</span>
</bursit-form-field>
```

### Tema

```typescript
import { BursitThemeService } from 'bursit-angular';

theme = inject(BursitThemeService);

// Cambiar tema
theme.setTheme('dark'); // 'light' | 'dark' | 'system'

// Toggle
theme.toggle();

// Señales reactivas
theme.mode; // Signal<ThemeMode>
theme.effectiveTheme; // Signal<'light' | 'dark'>
```

El tema se aplica automáticamente mediante el atributo `bursit-theme` en `<html>` y persiste en localStorage.

## Arquitectura

- **Directive-first**: Los primitivos son directivas sobre elementos nativos (`<button>`, `<input>`). Esto preserva accesibilidad y comportamiento nativo.
- **Standalone**: Todos los componentes y directivas son standalone. No se requiere `NgModule`.
- **Design tokens**: Todo el styling visual viene de `bursit-ui-tokens` vía `var()`. La librería solo provee CSS estructural (layout, estados).
- **Content projection**: `FormField` usa slots de proyección para label, control, error y helper.

## Development

```bash
npm install
npm run storybook      # Storybook en http://localhost:6006
npm run test           # Tests con Jest
npm run test:coverage  # Tests + coverage (umbral 80%)
npm run build          # Build de la librería + schematics
```

## Estructura del proyecto

```
projects/bursit-angular/
├── src/
│   ├── lib/
│   │   ├── button/     # ButtonDirective
│   │   ├── forms/      # FormField, InputDirective, LabelDirective
│   │   └── theme/      # BursitThemeService
│   ├── styles/         # SCSS estructural (_button.scss, etc.)
│   └── public-api.ts   # API pública
├── schematics/         # ng-add schematic
└── .storybook/         # Configuración de Storybook
```
