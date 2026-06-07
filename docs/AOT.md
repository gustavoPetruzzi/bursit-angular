# AOT vs JIT en Angular

## Conceptos clave

| Término                 | Significado                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- |
| **AOT** (Ahead-of-Time) | Compilación de templates durante `ng build`, antes de que el browser toque nada |
| **JIT** (Just-in-Time)  | Compilación de templates en el browser del usuario, en runtime                  |
| **Startup Time**        | Tiempo desde que el usuario abre la URL hasta que la app es interactiva         |
| **Build Time**          | Tiempo que tarda `ng build` en generar los archivos finales                     |

---

## Cómo funciona AOT — explicado con código de bursit-angular

### Template original (`form-field.html`)

```html
@if (formFieldControl()?.invalid) {
<ng-content select="bursit-error"></ng-content>
}
```

### Lo que genera el compilador AOT (pseudocódigo del output Ivy)

```javascript
function FormField_Template(rf, ctx) {
  if (rf & 1) {           // creation mode
    ɵɵprojection(0);      // <ng-content select="[bursitLabel]">
    ɵɵprojection(1);      // <ng-content></ng-content>
    ɵɵtemplate(2, ...);   // @if branch (template anidado)
    ɵɵprojection(3);      // <ng-content select="bursit-message">
  }
  if (rf & 2) {           // update mode (change detection)
    if (ctx.formFieldControl()?.invalid) {
      ɵɵprojection(4);
    }
  }
}
```

El browser **nunca recibe HTML crudo**. Recibe instrucciones JavaScript ya compiladas. Sin parser, sin compilador de templates en runtime.

### Bindings del host (`button.directive.ts`)

```typescript
host: {
  '[class.bursit-button-primary]': 'color === "primary"',
}
```

La expresión `color === "primary"` se compila a instrucciones de Ivy en build time. El browser solo ejecuta las instrucciones.

---

## Comparación Build Time vs Startup Time

| Fase                    | JIT (histórico, obsoleto)            | AOT (actual, Angular v9+)                    |
| ----------------------- | ------------------------------------ | -------------------------------------------- |
| **Build Time**          | ~3s                                  | ~6-12s (medido en bursit-angular: **6.16s**) |
| **Bundle Size**         | +300KB (incluye `@angular/compiler`) | Sin el compilador                            |
| **Startup Time**        | 1-3s (compila en el browser)         | <500ms (viene pre-compilado)                 |
| **Errores de template** | En runtime 💥                        | En build ✅                                  |

**Ecuación**: pagás más tiempo en build (lo sufre la CI) para que el usuario tenga una experiencia instantánea.

---

## Modos de compilación

### `partial` — para librerías

```json
// tsconfig.lib.prod.json
"angularCompilerOptions": {
  "compilationMode": "partial"
}
```

La librería se compila AOT pero de forma incompleta — deja metadatos de Ivy (`.ngsummary.json`, referencias `ɵcmp`) para que la **app consumidora** haga el AOT final. Esto permite tree-shaking de componentes no usados.

### `full` — para aplicaciones (default)

La app final compila todo a JavaScript puro. Es donde ocurre la compilación AOT completa. El browser recibe solo instrucciones Ivy, cero HTML crudo.

---

## Cómo medir startup time en una app Angular

### PerformanceObserver nativo del browser

```typescript
// main.ts
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`⏱ ${entry.name}: ${entry.startTime.toFixed(0)}ms`);
  }
});
observer.observe({ type: 'largest-contentful-paint', buffered: true });
observer.observe({ type: 'first-input', buffered: true });
```

### Métricas clave (Core Web Vitals)

- **LCP** (Largest Contentful Paint) — cuándo el contenido principal es visible
- **TTI** (Time to Interactive) — cuándo la app responde a clicks
- **INP** (Interaction to Next Paint) — latencia de interacciones

### Herramientas

- Chrome DevTools → Lighthouse tab
- PageSpeed Insights
- `ng build` + servir los archivos con `npx http-server dist/`

---

## Ver AOT en acción

```bash
# En un proyecto aplicación (no library), generá los bundles sin hash:
ng build --output-hashing=none

# Abrí dist/ y buscá los .js — vas a ver instrucciones ɵɵ en vez de HTML crudo
grep -r "ɵɵ" dist/
```

---

## Fuentes

### Oficiales de Angular

- [Angular Compiler Options](https://angular.dev/reference/configs/angular-compiler-options)
- [Ahead-of-Time (AOT) Compilation](https://angular.dev/tools/cli/aot-compiler)
- [Ivy Compiler Architecture](https://angular.dev/guide/ivy)

### Deep dives

- [Inside Ivy: The New Compiler of Angular](https://blog.angular.dev/inside-ivy-the-new-compiler-of-angular-ff698dce0f12)
- [web.dev: Largest Contentful Paint (LCP)](https://web.dev/articles/lcp)
- [web.dev: Interaction to Next Paint (INP)](https://web.dev/articles/inp)
