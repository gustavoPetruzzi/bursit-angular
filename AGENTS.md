# AGENTS.md — bursit-angular

## Build & Dev

```bash
npm run build          # Build library (schematics + ng-packagr)
npm run build:schematics # Compile schematics only
npm run watch           # Watch mode for development
npm run test            # Run Jest tests
npm run test:coverage   # Run tests with coverage report
npm run storybook       # Start Storybook on port 6006
npm run build-storybook # Build static Storybook
```

## Architecture

- **`projects/bursit-angular/`** — Angular library (ng-packagr)
  - `src/lib/` — components, directives, services
  - `src/styles/` — SCSS entry points (`_button.scss`, etc.)
  - `src/public-api.ts` — public surface
- **`projects/bursit-angular/schematics/`** — Angular CLI schematics
- **`dist/`** — build output (not committed, generated on `npm run build`)
- **`bursit-ui-tokens/`** (sibling) — design token package, consumed as file: dependency

## Project Conventions

### Branch naming

```
^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)/[a-z0-9._-]+$
```

Examples: `feat/add-button-directive`, `fix/modal-z-index`, `chore/update-tokens`

### Commit messages (Conventional Commits)

```
<type>(<scope>)?: <description>

Types: feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert
Examples:
  feat(button): add secondary variant styling
  fix(tokens): correct secondary hover color
  chore: update dependencies
```

### Pull requests

- Every PR must reference an issue (`Closes #N`)
- Use the PR template from `.github/PULL_REQUEST_TEMPLATE.md`
- CI must pass before merge (tests + build)

### Code style

- TypeScript: strict mode (`strict: true` in tsconfig)
- Prettier: 100 char line width, single quotes, Angular HTML parser for .html files
- SCSS: use design tokens via CSS custom properties, never hardcode colors

### Testing

- Jest with `jest-preset-angular`
- Coverage threshold: 80% for lib files
- Test files: `*.spec.ts` alongside the source file

### Pre-commit hooks (husky + lint-staged)

```bash
npm run prepare          # Initializes husky (runs on npm install)
```

On commit: prettier formats staged files + tests run on staged spec files.

## Project Structure

```
bursit-angular/
├── .storybook/           # Storybook configuration
├── .atl/                 # Agent Tools Lite (SDD context)
│   └── skill-registry.md # Skill triggers for this project
├── .github/
│   └── workflows/        # GitHub Actions (do it yourself!)
├── projects/
│   └── bursit-angular/
│       └── src/
│           ├── lib/      # Library source
│           ├── styles/  # SCSS entry points
│           └── setup-jest.ts
├── dist/                 # Build output
└── coverage/             # Test coverage reports
```

## Design Token Usage

All colors, spacing, and typography MUST use CSS custom properties from `bursit-ui-tokens`:

```scss
// ❌ Don't hardcode
color: #7c1a2b;
padding: 8px;

// ✅ Do use tokens
color: var(--color-primary);
padding: var(--space-sm);
```

## Key Files

| File                                        | Purpose                                             |
| ------------------------------------------- | --------------------------------------------------- |
| `jest.config.js`                            | Jest configuration, coverage paths                  |
| `angular.json`                              | Angular CLI config (build, test, storybook targets) |
| `tsconfig.json`                             | TypeScript strict config, path aliases              |
| `projects/bursit-angular/src/public-api.ts` | Library public API                                  |
