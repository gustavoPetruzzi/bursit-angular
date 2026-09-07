# Proposal: Tooltip Directive

**Change**: `add-tooltip`
**Status**: Proposed
**Created**: 2026-08-28

## Intent

The library has no tooltip: consumers needing contextual help fall back to native `title` (unstyled, inaccessible). Add an APG-conformant `[bursitTooltip]` directive using the CDK overlay already proven by modal/select. The full `--tooltip-*` token set already ships in bursit-ui-tokens — no token work needed.

## Scope

### In Scope
- `[bursitTooltip], [bursit-tooltip]` attribute directive; hover (mouseenter/leave) + focus (focusin/out) triggers, Escape dismiss.
- Content input `string | TemplateRef | null`, live signal propagation.
- Internal `TooltipPanelComponent` (`role="tooltip"`) in a CDK `Overlay` + `ComponentPortal` + `FlexibleConnectedPositionStrategy`; kept out of the public barrel.
- Positions top/bottom/left/right with viewport-overflow flip; `positionChanges` re-orients arrow; viewport margin + `reposition()` scroll strategy.
- showDelay (300ms) / hideDelay (100ms), cancellable timers, `ngOnDestroy` disposal.
- `disabled()` input; `aria-describedby` save/restore (never clobbers user values); `shown`/`hidden` outputs; arrow via `--tooltip-arrow-*` tokens.
- CSF3 stories + Jest specs; add `@angular/cdk` peerDependency (pre-existing packaging gap).

### Out of Scope
- Touch tap-toggle mode (focus covers focusable hosts; v2 candidate).
- Interactive tooltips (APG non-interactive pattern).
- New design tokens (complete set already exists).
- `<bursit-tooltip>` wrapper component (rejected — clunky API, no repo precedent).

## Capabilities

> Contract with the specs phase.

### New Capabilities
- `tooltip`: hover/focus/Escape triggers, positioning with flip, show/hide delays, ARIA wiring (`role`, `aria-describedby`), disabled state, string/TemplateRef content.

### Modified Capabilities
- None.

## Approach

Attribute directive (button precedent, dual camel/kebab selector) hosting an internal panel component in a programmatic CDK overlay (modal.service.ts precedent). A 4-position fallback chain on `FlexibleConnectedPositionStrategy` provides flip-on-overflow; `positionChanges` updates the panel position class so the arrow re-orients. Cancellable delay timers; `aria-describedby` via select's save/restore pattern. Panel consumes `--tooltip-*` tokens in co-located SCSS (no global stylesheet). Folds in the `@angular/cdk` peerDependencies fix.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/tooltip/` | New | Directive + panel + SCSS + spec + stories + barrel |
| `src/lib/index.ts` | Modified | Export tooltip barrel (panel internal) |
| `projects/bursit-angular/package.json` | Modified | Add `@angular/cdk` peer dep |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Flip breaks arrow alignment | Medium | `positionChanges` → panel class sync |
| Timer/overlay leaks | Medium | Cancel timers + `dispose()` in `ngOnDestroy`; idempotent hide |
| `aria-describedby` clobbering | Medium | Save/restore; touch only when owned |
| Touch devices (no hover) | Medium | Focus-trigger documented; tap-toggle deferred to v2 |
| Review budget (~1000 lines) | High | Chained PR slices in tasks (directive+tests / stories+packaging) |

## Rollback Plan

All additive: remove `src/lib/tooltip/`, revert one `lib/index.ts` export line and the peerDependency entry. No existing behavior modified; reverting the branch fully removes the feature.

## Dependencies

- `@angular/cdk` (already a direct dependency; peer entry added).
- `bursit-ui-tokens` — tooltip token set already shipped, no changes.

## Success Criteria

- [ ] Hover/focus show; Escape dismisses; panel `pointer-events: none`.
- [ ] Flips to available viewport edge; arrow re-orients with flip.
- [ ] `aria-describedby` set on show, restored on hide; user-set values untouched.
- [ ] `npm run test` green (tooltip coverage ≥ 80%); `npm run build` passes.
- [ ] Stories cover hover, focus, 4 positions, delays, disabled, TemplateRef, arrow toggle.