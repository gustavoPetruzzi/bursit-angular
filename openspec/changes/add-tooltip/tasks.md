# Tasks: Tooltip Directive (add-tooltip)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~900–1100 total (Slice 1 ~370–420, Slice 2 ~370–450, Slice 3 ~180–240) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 core → PR 2 tests → PR 3 stories |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain (design §PR Slicing Guidance) |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Core: type, panel+SCSS, directive, barrels, peer dep | PR 1 (base = `feat/add-tooltip` tracker) | `npm run build` | N/A — no specs/stories in slice by design; visual harness lands PR 3 | Revert branch: `src/lib/tooltip/` + 1 `lib/index.ts` line + 1 peer-dep entry |
| 2 | Directive + panel Jest specs (14 scenarios) | PR 2 (base = PR 1 branch) | `npm run test -- tooltip` | N/A — jsdom fake-timer unit layer per design | Revert branch: spec files only |
| 3 | CSF3 stories + final verification | PR 3 (base = PR 2 branch) | `npm run test` && `npm run build` | `npm run storybook` — flip at viewport edges (SCENARIO-05/06) | Revert branch: stories file only |

## PR 1 — Core Implementation

- [ ] 1.1 Create `src/lib/tooltip/tooltip-position.type.ts`: `TooltipPosition = 'top' | 'bottom' | 'left' | 'right'`.
- [ ] 1.2 Create `src/lib/tooltip/tooltip-panel.component.ts`: standalone internal panel, host `role="tooltip"` + `[id]` (static `bursit-tooltip-${n}`) + `bursit-tooltip-{top|bottom|left|right}` class, inputs `content`/`position`/`arrow`/`panelId`, inline `@if` string/TemplateRef modes, OnPush, `pointer-events: none`.
- [ ] 1.3 Create `src/lib/tooltip/tooltip-panel.component.scss`: `--tooltip-*` tokens only (bg, color, typography, padding, radius, shadow, arrow), arrow per position class, `prefers-reduced-motion` guard.
- [ ] 1.4 Create `src/lib/tooltip/tooltip.directive.ts` (`[bursitTooltip], [bursit-tooltip]`): inputs `content` (alias; `string\|TemplateRef\|null`), `position`, `showDelay` 300, `hideDelay` 100, `disabled`, `arrow`; outputs `shown`/`hidden`; HostListeners mouseenter/leave, focusin/out, keydown Escape; programmatic `Overlay` + `ComponentPortal` + `FlexibleConnectedPositionStrategy` fallback (requested → opposite → remaining), `offsetY/X ±8`, `withViewportMargin(8)`, `positionChanges` → `setInput('position')`; cancellable timers; content `effect()` (null → immediate hide); `aria-describedby` append panelId / restore exact `orig` (fresh capture per show); `disabled()`/host `[disabled]` suppress + hide open; `ngOnDestroy` cancels timers + `dispose()`.
- [ ] 1.5 Create `src/lib/tooltip/index.ts` barrel: export directive + `TooltipPosition` (panel stays internal).
- [ ] 1.6 Modify `src/lib/index.ts`: add `export * from './tooltip'`.
- [ ] 1.7 Modify `projects/bursit-angular/package.json`: peerDependency `"@angular/cdk": "^21.0.0"` (REQ-tooltip-14).
- [ ] 1.8 Verify: `npm run build` green (ng-packagr + strict TS); no hardcoded colors/spacing.

## PR 2 — Unit Tests

- [ ] 2.1 Create `src/lib/tooltip/tooltip.directive.spec.ts` (TestHost + `jest.useFakeTimers()`, assert via `.cdk-overlay-container`): SCENARIO-01/02 string+TemplateRef content, live null → hide + aria cleared; 03/04 show waits 300ms, Escape/leave/blur cancels pending show, hide after 100ms, focus stays on host; 09/10 aria set/restore, user `"hint"` preserved exactly; 11/12 disabled suppresses show + no `shown`, `shown`/`hidden` emit once; 13 destroy mid-show cancels timer, no overlay, no errors.
- [ ] 2.2 Create `src/lib/tooltip/tooltip-panel.component.spec.ts`: SCENARIO-07/08 role, content modes, position class, `pointer-events: none`, nothing focusable.
- [ ] 2.3 Verify: `npm run test -- tooltip` green, coverage ≥ 80%.

## PR 3 — Stories & Final Verification

- [ ] 3.1 Create `src/lib/tooltip/tooltip.directive.stories.ts` (CSF3, mirror select/checkbox): hover, focus, 4 positions, delays, disabled, TemplateRef, arrow toggle, dark. `OverlayModule` already global in `projects/bursit-angular/.storybook/preview.ts` — no config change.
- [ ] 3.2 Verify: `npm run test` (all suites) + `npm run build` green.
- [ ] 3.3 Manual: `npm run storybook` — flip at viewport edges re-orients arrow (SCENARIO-05/06), Escape dismiss.