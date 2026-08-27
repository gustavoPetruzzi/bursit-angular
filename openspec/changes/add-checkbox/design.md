# Design: add-checkbox

## Technical Approach

New standalone signal-based component following the Select pattern (`forms/select/select.ts`): provides itself as both `ControlValueAccessor` and `FormFieldControl` via `forwardRef`, consumes existing `--checkbox-*` design tokens, and ships its own SCSS entry point. No floating-label machinery — those `FormFieldControl` members stay unimplemented (all optional).

## Architecture Decisions

| # | Decision | Alternatives considered | Rationale |
|---|----------|------------------------|-----------|
| 1 | Component `bursit-checkbox` (not attribute directive) | Directive on native input like InputDirective | Needs its own template/visual box + projected label; a bare directive can't render the styled box |
| 2 | Native `<input type="checkbox">` inside component template | Fully custom div + ARIA | Native semantics give keyboard, focus, and screen-reader behavior for free; spec forbids role overrides |
| 3 | Dual provision: `CVA` + `FormFieldControl` via `forwardRef` | Only CVA; FormField integration later | Matches Select exactly; FormField integration was an explicit product decision |
| 4 | Indeterminate as `input<boolean>` + effect syncing DOM `.indeterminate` property; cleared on user toggle; never written to form value | Custom three-state value type (`true/false/null`) | Spec defines indeterminate as view-state only; three-state values leak into FormControl and break validators |
| 5 | Id strategy: use injected `FORM_FIELD_ID` when inside form-field, else locally generated id (`createFieldId()`-style) for label association | Always generate own id | Inside form-field, `${fieldId}-error/-message` describedby wiring depends on the input id matching fieldId — same contract InputDirective honors |
| 6 | No new `FormFieldTypes.CHECKBOX` enum member | Add enum value | Floating-label layout is the only consumer of `type`; checkbox never floats its label |
| 7 | Component styles via `styleUrl` (`checkbox.scss`) consuming `--checkbox-*` tokens | Global sheet in `src/styles/` | Repo convention verified: every COMPONENT (select, modal, icon, avatar...) uses `styleUrl`; global sheets in `src/styles/` exist only for attribute DIRECTIVES (button/input/label) which cannot carry their own styles |

## Data Flow

    User click / Space ──→ input change event ──→ checked signal update
                                                ├─→ onChange(boolean) ──→ FormControl.value
                                                └─→ indeterminate visual cleared
    FormControl.setValue/disable ──→ writeValue/setDisabledState ──→ signals ──→ template
    NgControl statusChanges ──→ invalid/disabled signals ──→ FormField host classes + error slot
    Blur ──→ registerOnTouched (+ queueMicrotask invalid re-check, per InputDirective pattern)

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/forms/checkbox/checkbox.ts` | Create | Component: signals, CVA, FormFieldControl, id/describedby wiring |
| `src/lib/forms/checkbox/checkbox.html` | Create | `<input type="checkbox">` + `<ng-content>` label area |
| `src/lib/forms/checkbox/checkbox.spec.ts` | Create | Unit tests per spec scenario (strict TDD: RED first) |
| `src/lib/forms/checkbox/index.ts` | Create | Folder barrel |
| `src/lib/forms/checkbox/checkbox.stories.ts` | Create | Stories mirroring input/select structure |
| `src/lib/forms/checkbox/checkbox.scss` | Modify | Token-driven component styles (`--checkbox-*`), encapsulated via existing styleUrl |
| `src/lib/forms/index.ts` | Modify | Export checkbox barrel |

## Interfaces / Contracts

Public API surface (component inputs/outputs):

```ts
// selector: 'bursit-checkbox'
checked = model(false);
indeterminate = input(false);
required = input(false);        // mirrors InputDirective
disabled = model(false);        // synced with NgControl status
validationInteraction = input<'default' | 'touched'>('default');
```

Visual strategy (revised): the native `<input type="checkbox">` stays visible in the template and is styled directly with `appearance: none`; the box (border, background, focus ring) and the checkmark/indeterminate glyph are drawn on the input itself via `::after`. No sibling `<span>` visual layer and no hidden/opacity-0 input. State-driven visuals bind from the signals (`checked()/indeterminate()/disabled()`) and host classes; the `focused()` signal stays — it feeds the `FormFieldControl` contract in PR 2. Native keyboard/focus semantics remain provided by the real input.

`FormFieldControl<T>` implementation covers: `invalid`, `disabled`, `required`, `focused`, `hovered`, `control` (NgControl). Intentionally unimplemented: `floatingLabel`, `hasPlaceholder`, `hasValue`, `type`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Toggle, Space key, CVA round-trip, disable, touched-on-blur | Jest + ReactiveFormsModule harness like input.directive.spec.ts |
| Unit | Indeterminate: renders, clears on user toggle, never mutates control value | Assert FormControl.value stays boolean across transitions |
| Integration | Inside `bursit-form-field`: error slot id + aria-describedby, disabled class propagation | Fixture with required FormControl, pre-touched |
| Storybook | Default, Disabled, Required, ErrorState, Indeterminate, InsideFormField, Playground | Manual + existing story patterns |

Strict TDD is active: each spec scenario gets a RED test before implementation.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Purely additive; revert the feature branch to roll back.

## Resolved Questions

- [x] Click on indeterminate checkbox → checks it (`true`). RESOLVED by following native behavior: the browser clears `.indeterminate` and toggles `checked` on activation (HTML spec). Verified against Angular Material (visual-only indeterminate + `indeterminateChange`), Radix UI (three-state value, uncontrolled use broken — issues #2494/#2689), and PrimeNG (real three-state ships as separate `TriStateCheckbox`). No special-case code needed; only the DOM property sync effect from task 2.4.
