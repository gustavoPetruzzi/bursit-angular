# Contributing to Bursit Angular

Thank you for wanting to contribute! Every contribution is welcome: bugs, improvements, new components, and documentation. Rule number one: **every PR comes from an issue**. First the problem is discussed, then the code is written.

## Quick workflow

1. **Open an issue first**: use the [bug report](../../issues/new?template=bug_report.md) or [feature request](../../issues/new?template=feature_request.md) template.
2. **Create a branch** from `main` following the naming convention (see table below).
3. **Develop with tests**: every new directive/component ships with its `*.spec.ts`.
4. **Verify locally**: `npm run test` and `npm run build` must pass.
5. **Open the PR** referencing the issue with `Closes #N`.

## Environment setup

```bash
npm install          # Installs dependencies
npm run storybook    # Visual development at http://localhost:6006
npm run test         # Tests with Jest
npm run build        # Library + schematics build
```

## Project conventions

| Topic            | Convention                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| Branches         | `<type>/<description>` — types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test` |
| Commits          | [Conventional Commits](https://www.conventionalcommits.org/): `feat(button): add secondary variant` |
| TypeScript       | Strict mode, no unnecessary `any`                                          |
| Styles           | Always design tokens (`var(--color-primary)`), **never** hardcoded values   |
| Tests            | Jest + `jest-preset-angular`, minimum coverage **80%** in `lib/`            |
| Components       | Standalone, directive-first over native elements                           |

### Branch and commit examples

```
feat/add-tooltip-directive
fix/modal-z-index
```

```
feat(button): add secondary variant styling
fix(tokens): correct secondary hover color
```

## Checklist before opening a PR

- [ ] `npm run test` passes (and coverage stays above 80%)
- [ ] `npm run build` passes
- [ ] No hardcoded colors, spacing, or typography (CSS tokens only)
- [ ] New components/directives have Storybook stories
- [ ] The PR references the issue with `Closes #N`
- [ ] CI is green

## Reporting bugs and proposing improvements

- 🐞 **Found a bug?** → [Open a bug report](../../issues/new?template=bug_report.md)
- ✨ **Have an idea?** → [Open a feature request](../../issues/new?template=feature_request.md)

The more context you provide (minimal reproduction, versions, screenshots), the faster we can act.

## Project structure

```
projects/bursit-angular/
├── src/
│   ├── lib/          # Directives, components, and services
│   ├── styles/       # Structural SCSS (layout and states only)
│   └── public-api.ts # Library public API
└── schematics/       # ng-add schematic
```

Changes to the public API must be exported from `public-api.ts`.