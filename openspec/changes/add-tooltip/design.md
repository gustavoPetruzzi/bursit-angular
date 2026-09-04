# Design: Tooltip Directive

## Technical Approach

Attribute directive `[bursitTooltip], [bursit-tooltip]` (button precedent) with an internal `TooltipPanelComponent` in a programmatic CDK overlay (modal precedent): `Overlay.create()` + `ComponentPortal` + `FlexibleConnectedPositionStrategy` fallback chain (select precedent). Hover/focus show, leave/blur/Escape hide, cancellable delays; `positionChanges` drives the arrow class; `aria-describedby` append-and-restore; `--tooltip-*` tokens in co-located panel SCSS; `@angular/cdk` peer-dep fix (REQ-tooltip-14).

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Overlay attach | Programmatic `Overlay` + `ComponentPortal` | Declarative `cdk-connected-overlay` | A directive has no template for the declarative block. Matches modal.service + CDK MatTooltip. |
| Flip → arrow | `positionChanges` → `panelRef.setInput('position', pos)` | `panelClass` per ConnectedPosition | `panelClass` lands on the overlay pane, unreachable by emulated-encapsulated panel styles; panel-host class keeps arrow CSS local. `takeUntilDestroyed`. |
| Position input change while open | `strategy.withPositions(buildPositions(p))` + `updatePosition()` | Recreate overlay | Reuses overlay/portal; `positionChanges` corrects on flip. Optimistic class until first emission. |
| Delay timers | `setTimeout` handles in directive, `_cancelTimers()`, cancelled in `ngOnDestroy` | RxJS `timer()` | Single-authority cancellation; trivial fake-timer tests. Show 300ms / hide 100ms; Escape hides after hideDelay, focus stays on host. |
| aria-describedby | **Append** while open: `orig === null ? panelId : orig + ' ' + panelId`; restore exact `orig` on hide; captured fresh each show | Replace (set panelId only) | Preserves user values (SCENARIO-tooltip-10); re-capture avoids stale restore. |
| Gap / margin | Strategy `offsetY`/`offsetX` ±8 + `withViewportMargin(8)` (select precedent); no `withPush` | Token margin in SCSS; `withPush(true)` | Gap is positioning config, not panel styling; push distorts anchor semantics. |
| Content propagation | `effect()` forwarding `content()` → `setInput`; null → immediate hide + restore | Injector token + outlet | Effect is idiomatic signal wiring; immediate null-hide matches SCENARIO-tooltip-02. |
| Position type | Union `'top' \| 'bottom' \| 'left' \| 'right'` exported from barrel | Enum | Button's `ButtonColor` union precedent. |

## Data Flow

```
mouseenter/focusin → _show(): cancel hide timer → showTimer(300) → attach portal → shown.emit();
  panel class set (optimistic) → positionChanges corrects on flip → aria-describedby: append panelId
mouseleave/focusout/Escape → _hide(): cancel show timer → hideTimer(100) → detach → hidden.emit(); restore aria
content()→null / disabled()→true → cancel timers + immediate detach + restore; ngOnDestroy → cancel + dispose (SCENARIO-tooltip-13)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/tooltip/tooltip-position.type.ts` | Create | `TooltipPosition` union |
| `src/lib/tooltip/tooltip-panel.component.ts` | Create | Internal panel: role, content modes, arrow, position class, OnPush |
| `src/lib/tooltip/tooltip-panel.component.scss` | Create | `--tooltip-*` tokens only; arrow per position class; reduced-motion guard |
| `src/lib/tooltip/tooltip.directive.ts` | Create | Inputs/outputs, timers, triggers, overlay lifecycle, aria wiring |
| `src/lib/tooltip/index.ts` | Create | Barrel: directive + position type (panel stays internal) |
| `src/lib/tooltip/tooltip.directive.spec.ts` | Create | User-owned Jest specs (fake timers) |
| `src/lib/tooltip/tooltip-panel.component.spec.ts` | Create | User-owned Jest specs |
| `src/lib/tooltip/tooltip.directive.stories.ts` | Create | CSF3 stories (user-owned) |
| `src/lib/index.ts` | Modify | Add `export * from './tooltip'` |
| `projects/bursit-angular/package.json` | Modify | Add `@angular/cdk: ^21.0.0` peer dep |

## Interfaces / Contracts

```ts
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Directive({ selector: '[bursitTooltip], [bursit-tooltip]', ... })
export class TooltipDirective {
  content = input<string | TemplateRef<unknown> | null>(null, { alias: 'bursitTooltip' });
  position = input<TooltipPosition>('top');
  showDelay = input<number>(300);
  hideDelay = input<number>(100);
  disabled = input<boolean>(false);
  arrow = input<boolean>(true);
  readonly shown = output<void>();
  readonly hidden = output<void>();
}
```

Panel contract (internal): inputs `content`, `position`, `arrow`, `panelId`; host `role="tooltip"`, `[id]`, `bursit-tooltip-{top|bottom|left|right}` class. Directive DI: `inject(Overlay)`, `inject(ScrollStrategyOptions)`, `inject(DestroyRef)`, `inject(ElementRef)`; `@HostListener` mouseenter/mouseleave/focusin/focusout/keydown (input.directive precedent); static uid `bursit-tooltip-${n}` (select precedent). Fallback chain: requested → opposite → remaining sides.

## Testing Strategy (user-implemented)

| Layer | What | Approach |
|-------|------|----------|
| Unit | Delays, cancellation, outputs once, disabled, destroy mid-show, content→null (02-04, 11-13) | TestHost + `jest.useFakeTimers()`, assert via `.cdk-overlay-container` |
| Unit | Panel role, content modes, arrow class | TestBed, `@if` modes |
| Unit | aria append/restore (09/10) | Host with/without `aria-describedby`, assert exact strings |
| Integration | Overlay attach/detach, position-class wiring | Real overlay in jsdom (modal.service.spec precedent) |
| Manual | Flip correctness (05/06) | jsdom lacks layout → `positionChanges` unit wiring + Storybook check at viewport edges |
| Stories | hover, focus, 4 positions, delays, disabled, TemplateRef, arrow, dark | CSF3; `OverlayModule` global in `.storybook/preview.ts` |

## PR Slicing Guidance (for sdd-tasks)

~900–1100 changed lines exceeds the 400-line budget → chained PRs on a feature branch (sdd-phase-common §E):
- **Slice 1 — core + directive tests**: `tooltip-position.type.ts`, panel + SCSS, directive, barrels, `lib/index.ts`, `tooltip.directive.spec.ts`.
- **Slice 2 — panel tests + stories + packaging**: panel spec, stories, `package.json` peer dep.
Each slice green (tests + build) and rollback-able. If Slice 1 exceeds ~400 lines, split the directive spec out.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration. Additive: removing `src/lib/tooltip/`, reverting the `lib/index.ts` line and peer-dep entry fully rolls back.

## Open Questions

None blocking.