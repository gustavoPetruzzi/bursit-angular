# Contribuir a Bursit Angular

¡Gracias por querer contribuir! Toda contribución es bienvenida: bugs, mejoras, nuevos componentes y documentación. La regla número uno: **todo PR nace de un issue**. Primero se discute el problema, después se escribe el código.

## Flujo rápido

1. **Abre un issue primero**: usa el template de [reporte de bug](../../issues/new?template=bug_report.md) o de [propuesta de mejora](../../issues/new?template=feature_request.md).
2. **Crea una rama** desde `main` siguiendo la convención de nombres (ver tabla abajo).
3. **Desarrolla con tests**: cada directiva/componente nuevo lleva su `*.spec.ts`.
4. **Verifica localmente**: `npm run test` y `npm run build` deben pasar.
5. **Abre el PR** referenciando el issue con `Closes #N`.

## Configuración del entorno

```bash
npm install          # Instala dependencias
npm run storybook    # Desarrollo visual en http://localhost:6006
npm run test         # Tests con Jest
npm run build        # Build de la librería + schematics
```

## Convenciones del proyecto

| Tema             | Convención                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| Ramas            | `<tipo>/<descripcion>` — tipos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test` |
| Commits          | [Conventional Commits](https://www.conventionalcommits.org/): `feat(button): add secondary variant` |
| TypeScript       | Strict mode, sin `any` innecesarios                                        |
| Estilos          | Siempre design tokens (`var(--color-primary)`), **nunca** valores hardcodeados |
| Tests            | Jest + `jest-preset-angular`, coverage mínimo **80%** en `lib/`            |
| Componentes      | Standalone, directive-first sobre elementos nativos                        |

### Ejemplos de ramas y commits

```
feat/add-tooltip-directive
fix/modal-z-index
```

```
feat(button): add secondary variant styling
fix(tokens): correct secondary hover color
```

## Checklist antes de abrir el PR

- [ ] `npm run test` pasa (y el coverage no baja de 80%)
- [ ] `npm run build` pasa
- [ ] No hay colores, espaciados ni tipografía hardcodeados (solo tokens CSS)
- [ ] Componentes/directivas nuevos tienen stories en Storybook
- [ ] El PR referencia el issue con `Closes #N`
- [ ] La CI pasa en verde

## Reportar bugs y proponer mejoras

- 🐞 **¿Encontraste un bug?** → [Abre un reporte de bug](../../issues/new?template=bug_report.md)
- ✨ **¿Tienes una idea?** → [Abre una propuesta de mejora](../../issues/new?template=feature_request.md)

Mientras más contexto des (reproducción mínima, versiones, capturas), más rápido se puede actuar.

## Estructura del proyecto

```
projects/bursit-angular/
├── src/
│   ├── lib/          # Directivas, componentes y servicios
│   ├── styles/       # SCSS estructural (solo layout y estados)
│   └── public-api.ts # API pública de la librería
└── schematics/       # Schematic de ng-add
```

Los cambios en la API pública deben exportarse desde `public-api.ts`.
