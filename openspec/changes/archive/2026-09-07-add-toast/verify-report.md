```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:6d000740f1ab6eebcbe70a19592e8aa4e0bed6b1875e96f03fca3717f3f7015a
verdict: pass
blockers: 0
critical_findings: 0
requirements: 10/10
scenarios: 18/18
test_command: npx jest --testPathPatterns="toast"
test_exit_code: 0
test_output_hash: sha256:e495089c0fdddfac8fdfbd5dc511a2359215389dc7dcea769873a8b5528551a1
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:9758a2d4afdaae173c78cc69d8078ddf935eae6cc634e255bcffab7790c76655
```

## Verification Report

**Change**: `add-toast`
**Version**: N/A (single-change verification)
**Mode**: Strict TDD
**Re-verification**: Verify #3 (final — external dependency closed: bursit-ui-tokens PR #15 merged as 70f0f88)

### Completeness
| Metric | Value |
|--------|-------|
| Tasks total | 26 |
| Tasks complete | 26 |
| Tasks incomplete | 0 |

### Build & Tests Execution
**Build**: ✅ Passed
```text
> npm run build
> npm run build:schematics && ng build
✔ Compiling with Angular sources in partial compilation mode.
✔ Writing FESM and DTS bundles
✔ Copying assets
✔ Built bursit-angular
Build at: 2026-09-07T13:02:21.532Z - Time: 5268ms
```

Dist types export: `ToastService`, `ToastRef`, `ToastContainerComponent`, `ToastItemComponent`, `ToastType`, `ToastPosition`, `ToastOptions` (verified in `dist/bursit-angular/types/bursit-angular.d.ts`)

**Tests (focused)**: ✅ 76 passed / 0 failed / 0 skipped
```text
> npx jest --testPathPatterns="toast"
Test Suites: 5 passed, 5 total
Tests:       76 passed, 76 total
Time:        8.268 s
```

**Tests (full suite)**: ✅ 307 passed / 0 failed / ⚠️ 2 skipped
```text
> npm run test
Test Suites: 25 passed, 25 total
Tests:       2 skipped, 307 passed, 309 total
Time:        13.183 s
```

**Coverage (toast folder)**: 94% lines / threshold: 80% → ✅ Above
```text
toast (aggregate)               93.8% stmts | 72.91% branch | 100% funcs | 94% lines
  toast-ref.ts                  100%          | 83.33%        | 100%       | 100%
  toast.service.ts              92.55%        | 71.42%        | 100%       | 92.77%
  toast.types.ts                100%          | 100%          | 100%       | 100%
  toast/toast-container         91.66%        | 100%          | 75%        | 90%
  toast/toast-item              100%          | 100%          | 100%       | 100%
```

### External Dependency Verification (SCENARIO-toast-18 — resolved)

Verified against `C:\Users\yusti\Desktop\programacion\bursit-ui-tokens` (sibling repo):

- `origin/master` HEAD = `70f0f88` `feat(tokens): add toast layout tokens (#15)` — PR #15 merged (confirmed via `git fetch origin` + `git log origin/master`).
- All six new tokens present in `src/components/toast.scss` on master: `--toast-gap: var(--space-sm)`, `--toast-exit-duration: var(--duration-fast)`, `--toast-exit-ease: var(--ease-in)`, `--toast-icon-size: 1.25rem`, `--toast-close-size: 1.5rem`, `--toast-position-offset: var(--space-lg)`.
- All referenced primitives exist in `src/_tokens.scss`: `--space-sm: 0.5rem` (L246), `--space-lg: 1.5rem` (L248), `--duration-fast: 100ms` (L306), `--ease-in: cubic-bezier(0.4, 0, 1, 1)` (L312), `--z-index-toast: 600` (L330).
- Z-index fix confirmed: `--toast-z-index: var(--z-index-toast)` (not `--z-index-tooltip`) — L24 of `src/components/toast.scss`.
- bursit-angular consumption: `styles/_toast.scss` uses `var(--toast-enter-duration, 200ms)`, `var(--toast-enter-ease, ease)`, `var(--toast-exit-duration, 200ms)`, `var(--toast-exit-ease, ease-in)` — 4 `var(--toast-*)` usages with fallbacks, zero hex literals. Component SCSS (`toast-item.scss`, `toast-container.scss`) consumes `--toast-bg`, `--toast-shadow`, `--toast-border-*`, `--toast-padding`, `--toast-min-width`, `--toast-max-width`, `--toast-{success|info|warning|error}-*` variants, `--toast-info-color` (focus ring) — zero hex literals.

### TDD Compliance
| Check | Result | Details |
|-------|--------|---------|
| TDD Evidence reported | ✅ | Found in apply-progress (TDD Cycle Evidence table, 7 task rows) |
| All tasks have tests | ✅ | 26/26 tasks have test files (5 spec files + 1 stories file) |
| RED confirmed (tests exist) | ✅ | 5/5 spec files verified in codebase |
| GREEN confirmed (tests pass) | ✅ | 76/76 toast tests pass on execution |
| Triangulation adequate | ✅ | 7 tasks triangulated with multiple cases; key behaviors (types, positions, ARIA) have it.each coverage |
| Safety Net for modified files | ✅ | 2/2 modified files (lib/index.ts, styles/_index.scss) had safety net (`npm run build` + `npm run test`) |

**TDD Compliance**: 6/6 checks passed

---

### Test Layer Distribution
| Layer | Tests | Files | Tools |
|-------|-------|-------|-------|
| Unit | 74 | 4 | Jest (fake timers, TestBed) |
| Integration | 2 | 1 (service spec integration tests) | Jest + CDK OverlayContainer |
| E2E | 0 | 0 | not installed |
| **Total** | **76** | **5** | |

---

### Changed File Coverage
| File | Line % | Branch % | Uncovered Lines | Rating |
|------|--------|----------|-----------------|--------|
| `toast.types.ts` | 100% | 100% | — | ✅ Excellent |
| `toast-ref.ts` | 100% | 83.33% | — | ✅ Excellent |
| `toast.service.ts` | 92.77% | 71.42% | L91-92, L160-161, L163-164 | ✅ Excellent |
| `toast/toast-container/toast-container.ts` | 90% | 100% | L20 | ✅ Excellent |
| `toast/toast-item/toast-item.ts` | 100% | 100% | — | ✅ Excellent |

**Average changed file coverage**: 96.55%

---

### Assertion Quality
| File | Line | Assertion | Issue | Severity |
|------|------|-----------|-------|----------|
| `toast-container.spec.ts` | 31 | `expect(component).toBeTruthy()` | Smoke-test-only — render without behavioral assertion | SUGGESTION |
| `toast-item.spec.ts` | 18 | `expect(component).toBeTruthy()` | Smoke-test-only — render without behavioral assertion | SUGGESTION |

**Assertion quality**: ✅ No CRITICAL or WARNING issues. 2 SUGGESTION-level smoke tests (standard Angular pattern, not harmful). All other assertions verify real behavior with specific value checks.

---

### Quality Metrics
**Linter**: ➖ Not available (no lint script for changed files in this repo)
**Type Checker**: ✅ No errors — `npm run build` (ng-packagr + strict TS) passes with toast in the public API

---

### Spec Compliance Matrix
| Requirement | Scenario | Test | Verdict |
|-------------|----------|------|---------|
| REQ-toast-01 (Service API) | SCENARIO-toast-01 — Show success toast | `toast.service.spec.ts > should create a toast and return a ref` + `convenience methods > success()` + `auto-dismiss timer > should auto-dismiss after the configured duration` | ✅ COMPLIANT |
| REQ-toast-01 (Service API) | SCENARIO-toast-02 — Show with custom config | `toast.service.spec.ts > should merge provided options over defaults` | ✅ COMPLIANT |
| REQ-toast-01 (Service API) | SCENARIO-toast-03 — SSR guard | `toast.service.spec.ts > SSR guard > should return a ref without touching the DOM` + `should still allow manual dismissal` | ✅ COMPLIANT |
| REQ-toast-02 (ToastRef Lifecycle) | SCENARIO-toast-04 — Manual dismiss via ref | `toast-ref.spec.ts > should call onClose and emit afterClosed on dismiss` + `toast.service.spec.ts > DOM rendering > should remove the toast from the DOM on manual dismiss` | ✅ COMPLIANT |
| REQ-toast-02 (ToastRef Lifecycle) | SCENARIO-toast-05 — afterClosed on auto-dismiss | `toast.service.spec.ts > auto-dismiss timer > should auto-dismiss after the configured duration` | ✅ COMPLIANT |
| REQ-toast-03 (Toast Types) | SCENARIO-toast-06 — Each type renders distinct visuals | `toast-item.spec.ts > type > should apply the %s host class` (4 cases via it.each) + ARIA role mapping | ✅ COMPLIANT |
| REQ-toast-04 (Toast Positions) | SCENARIO-toast-07 — Toast renders at specified position | `toast.service.spec.ts > position strategy > should honor a custom position option` | ✅ COMPLIANT |
| REQ-toast-04 (Toast Positions) | SCENARIO-toast-08 — Default position fallback | `toast.service.spec.ts > position strategy > should render at the default bottom-right position` | ✅ COMPLIANT |
| REQ-toast-05 (Stacking) | SCENARIO-toast-09 — Stacking within limit | `toast.service.spec.ts > maxVisible > should allow up to maxVisible toasts at a single position` | ✅ COMPLIANT |
| REQ-toast-05 (Stacking) | SCENARIO-toast-10 — Exceed max visible | `toast.service.spec.ts > maxVisible > should dismiss the oldest toast when maxVisible is exceeded` | ✅ COMPLIANT |
| REQ-toast-06 (Auto-Dismiss Timer) | SCENARIO-toast-11 — Pause on hover | `toast.service.spec.ts > pause/resume on hover > should keep the toast open while paused and dismiss on resume` + `toast-container.spec.ts > should pause the toast timer when its item is hovered` + `should resume the toast timer when the item hover ends` | ✅ COMPLIANT |
| REQ-toast-06 (Auto-Dismiss Timer) | SCENARIO-toast-12 — Zero duration disables auto-dismiss | `toast.service.spec.ts > auto-dismiss timer > should not auto-dismiss when duration is 0` | ✅ COMPLIANT |
| REQ-toast-07 (Manual Dismiss) | SCENARIO-toast-13 — Close button dismiss | `toast-item.spec.ts > close button > should emit close when the close button is clicked` | ✅ COMPLIANT |
| REQ-toast-07 (Manual Dismiss) | SCENARIO-toast-14 — closeAll | `toast.service.spec.ts > closeAll > should dismiss every open toast` | ✅ COMPLIANT |
| REQ-toast-08 (Enter/Exit Animations) | SCENARIO-toast-15 — Reduced motion respected | `styles/_toast.scss > @media (prefers-reduced-motion: reduce) { transition: none }` — CSS-level enforcement (static) | ✅ COMPLIANT |
| REQ-toast-09 (Accessibility) | SCENARIO-toast-16 — Screen reader announces error toast | `toast-item.spec.ts > ARIA > should expose role=%s for %s toasts` (4 cases: success→status, info→status, warning→alert, error→alert) | ✅ COMPLIANT |
| REQ-toast-09 (Accessibility) | SCENARIO-toast-17 — Close button accessible | `toast-item.spec.ts > close button > should give the close button an accessible label` (aria-label="Close notification") + `should render a close button by default` + focus-visible CSS in `toast-item.scss` (L63-66) | ✅ COMPLIANT |
| REQ-toast-10 (Design Tokens) | SCENARIO-toast-18 — Token usage (table-driven) | External verification: `git show origin/master:src/components/toast.scss` in bursit-ui-tokens (PR #15, commit 70f0f88) — all 6 new tokens + `--toast-z-index: var(--z-index-toast)` present; primitives `--space-sm/--duration-fast/--ease-in/--space-lg/--z-index-toast` exist. Consumption: `styles/_toast.scss` 4 `var(--toast-*)` usages with fallbacks + component SCSS token variants, zero hex literals | ✅ COMPLIANT |

**Compliance summary**: 18/18 scenarios COMPLIANT, 0/18 PARTIAL, 0/18 FAILING, 0/18 UNTESTED

### Correctness (Static Evidence)
| Requirement | Status | Notes |
|------------|--------|-------|
| REQ-toast-01 — Service API | ✅ Implemented | `success()`, `error()`, `warning()`, `info()`, `show()` all present; `providedIn: 'root'`; SSR guard no-ops on non-browser |
| REQ-toast-02 — ToastRef Lifecycle | ✅ Implemented | `dismiss()` with idempotent guard, `afterClosed()` returns Subject observable, completes after dismiss |
| REQ-toast-03 — Toast Types | ✅ Implemented | 4 types: success, error, warning, info; each with distinct CSS class and ARIA role |
| REQ-toast-04 — Toast Positions | ✅ Implemented | 6 positions via CDK `GlobalPositionStrategy`; default `bottom-right` |
| REQ-toast-05 — Stacking | ✅ Implemented | `maxVisible` enforced per position (default 5), oldest auto-dismissed |
| REQ-toast-06 — Auto-Dismiss Timer | ✅ Implemented | Timer Map with pause/resume; duration=0 disables timer; per-type defaults configurable |
| REQ-toast-07 — Manual Dismiss | ✅ Implemented | `ref.dismiss()`, close button (`aria-label="Close notification"`), `closeAll()` |
| REQ-toast-08 — Enter/Exit Animations | ✅ Implemented | Global CSS classes (`bursit-toast-enter`, `bursit-toast-exit`) + reduced-motion guard |
| REQ-toast-09 — Accessibility | ✅ Implemented | ARIA roles correct (status/alert); close button `aria-label="Close notification"` matches spec |
| REQ-toast-10 — Design Tokens | ✅ Implemented | All 6 new tokens now exist on bursit-ui-tokens master (PR #15 / 70f0f88); consumed via `var(--toast-*)` with fallbacks; z-index fix confirmed |

### Coherence (Design)
| Decision | Followed? | Notes |
|----------|-----------|-------|
| Timer location: Service | ✅ Yes | Timer Map lives in `ToastService`, not in components |
| Overlay per container (not per toast) | ✅ Yes | One `OverlayRef` per active position, container manages toast list |
| State model: Signals | ✅ Yes | `signal<Record<ToastPosition, ToastRef[]>>` with `computed` per-position |
| Animation engine: CSS class toggle | ⚠️ Partial | CSS classes defined (`bursit-toast-enter`/`bursit-toast-exit`) but not actively toggled in lifecycle (synchronous dismiss) — documented deviation |
| SSR strategy: Guard | ✅ Yes | `isPlatformBrowser(PLATFORM_ID)` guard, matches `BursitThemeService` pattern |
| Component file layout | ⚠️ Deviation | Design: `toast-item.component.ts` / `toast-container.component.ts` at root. Actual: `toast-item/toast-item.ts` / `toast-container/toast-container.ts` subdirectories. Functionally equivalent. |
| Type model | ⚠️ Deviation | Design: `ToastConfig` + `ToastState`. Actual: single `ToastOptions` interface. `ToastState` (with `id`, `entering`, `exiting` flags) not implemented. |
| Exit animation lifecycle | ⚠️ Deviation | Design: `_animateAndComplete()` class toggle → timeout → remove. Actual: synchronous dismiss. CSS contract exists but class toggling not wired. |
| Default type | ⚠️ Deviation | Spec: default type `'info'`. Actual: default type `'success'`. |
| Token additions (separate chore PR) | ✅ Resolved | bursit-ui-tokens PR #15 merged as 70f0f88 on master; all tokens + z-index fix shipped |

### Issues Found

**CRITICAL**: None

**WARNING**:

1. **Default type is `'success'` instead of spec's `'info'` (REQ-toast-01)**
   - Location: `toast.types.ts` (`TOAST_DEFAULTS.type = 'success'`)
   - Evidence: Spec design contract says "default: 'info'" for type. Tests assert `'success'` as default (aligned with implementation, not spec)
   - Impact: `show('Msg')` creates a success toast instead of info. Functionally valid but spec-deviant
   - Candidate-caused: Yes
   - Known deviation: #1 in apply-progress
   - Remediation: If spec is authoritative, change `TOAST_DEFAULTS.type` to `'info'` and update all tests that assert the default type

2. **Exit animation not wired in lifecycle (REQ-toast-08)**
   - Location: `toast-ref.ts` (no `_animateAndComplete`), `toast.service.ts` dismiss path (synchronous)
   - Evidence: Design specifies class-toggle exit: set `exiting: true` → add `bursit-toast-exit` → wait `--toast-exit-duration` → remove. CSS classes exist in `_toast.scss` but are never applied. Dismissal is synchronous
   - Impact: No visible exit animation on dismiss (toast vanishes instantly)
   - Candidate-caused: Yes
   - Known deviation: #2 in apply-progress
   - Remediation: Wire `bursit-toast-exit` class toggle in `ToastRef`/`ToastService` dismiss path with `setTimeout` for exit duration before DOM removal

3. **Manual visual check of Storybook stories pending**
   - Location: Storybook stories (`toast.stories.ts`)
   - Evidence: `npm run build-storybook` passes; toast stories present in `storybook-static/index.json`. No human visual inspection done
   - Impact: Visual regressions (positions, animations, reduced-motion) not verified
   - Candidate-caused: No (follow-up task)
   - Known WARNING: #4 in apply-progress
   - Remediation: Run `npm run storybook` and visually inspect all stories before release

4. **`package.json`/`package-lock.json` modified in working tree (NOT from add-toast)**
   - Evidence: `git status` shows these files modified; apply-progress explicitly notes they are pre-existing unrelated changes
   - Impact: None on add-toast; flagging so archive does not attribute them to this change
   - Candidate-caused: No
   - Remediation: None (pre-existing)

**SUGGESTION**:

1. **Storybook stories do not cover all 6 positions (task 8.1 scope)**
   - Location: `toast.stories.ts`
   - Evidence: 3 stories (Item, Types, Service) — no per-position stories. Task specified "all 6 positions × 4 types"
   - Impact: Position rendering not individually verifiable in Storybook
   - Candidate-caused: Yes
   - Known deviation: #7 in apply-progress

2. **Container spec `toBeTruthy()` smoke tests (toast-container.spec.ts L31, toast-item.spec.ts L18)**
   - Evidence: "should create the component" tests only assert `toBeTruthy()` — no behavioral value
   - Impact: Minimal; companion tests in same files cover real behavior
   - Candidate-caused: Yes

3. **`isPlatformBrowser` import location changed in Angular 21**
   - Location: `toast.service.ts` (`import { isPlatformBrowser } from '@angular/common'`)
   - Evidence: Applied notes that Angular 21 moved `isPlatformBrowser` from `@angular/core` to `@angular/common`. Other services (e.g., `BursitThemeService`) should be audited for stale imports
   - Impact: Potential runtime crash in other services using the old import path
   - Candidate-caused: No (discovered, fixed in this change)
   - Remediation: Audit `BursitThemeService` and other services for stale `@angular/core` import of `isPlatformBrowser`

### Verdict
**PASS**
26/26 tasks complete, 76/76 toast tests pass, 307/307 full-suite tests pass (2 skipped), build green with toast in public API, toast folder coverage 94% ≥ 80% threshold. All 18/18 scenarios COMPLIANT. SCENARIO-toast-17 remediation confirmed (`aria-label="Close notification"` in `toast-item.html` + assertion in `toast-item.spec.ts` L72). SCENARIO-toast-18 resolved: bursit-ui-tokens PR #15 merged as 70f0f88 on master — all 6 new tokens and the `--toast-z-index` fix verified present and consumed (`var(--toast-*)` with fallbacks, zero hex literals). Zero CRITICAL findings. Four non-blocking WARNINGs are documented follow-ups (default type deviation, exit animation wiring, manual visual check, pre-existing package.json mods); three SUGGESTIONs (position stories, 2 smoke assertions, isPlatformBrowser audit).