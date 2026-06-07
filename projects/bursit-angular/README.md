# Bursit Angular

Componentes UI para Angular basados en los design tokens de `bursit-ui-tokens`.

## Instalación

### Método recomendado: `ng add`

```bash
ng add bursit-angular
```

Esto hace todo automáticamente:

1. Instala `bursit-angular` y `bursit-ui-tokens`
2. Inyecta los estilos globales en tu `angular.json`
3. Deja tu proyecto listo para usar los componentes

> **Nota:** Si querés solo los tokens base (colores, spacing, tipografía) sin los tokens de componentes:
> ```bash
> ng add bursit-angular --includeComponentTokens=false
> ```

### Alternativa: `npm install` (configuración manual)

Si preferís instalar manualmente:

```bash
npm install bursit-angular
```

Luego agregá los estilos globales en tu `angular.json`:

```json
"styles": [
  "src/styles.css",
  "node_modules/bursit-ui-tokens/index.css"
]
```

O si solo querés los tokens base:

```json
"styles": [
  "src/styles.css",
  "node_modules/bursit-ui-tokens/tokens.css"
]
```

## Uso

### Button

```ts
import { Component } from '@angular/core';
import { Button } from 'bursit-angular';

@Component({
  selector: 'app-example',
  imports: [Button],
  template: `
    <button libButton>Click me</button>
    <button libButton class="is-small">Small</button>
    <button libButton class="is-large">Large</button>
  `
})
export class ExampleComponent {}
```

Los estilos se aplican automáticamente mediante la directiva `libButton`.

## Design Tokens

Esta librería consume las CSS Custom Properties definidas en `bursit-ui-tokens`. Podés usarlos en tus propios componentes:

```css
.mi-componente {
  background: var(--color-primary);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
}
```

## Desarrollo

### Build

```bash
ng build bursit-angular
```

### Tests

```bash
ng test
```

### Storybook

```bash
ng run bursit-angular:storybook
```

## Publicar

```bash
ng build bursit-angular
cd dist/bursit-angular
npm publish
```

## Licencia

MIT
