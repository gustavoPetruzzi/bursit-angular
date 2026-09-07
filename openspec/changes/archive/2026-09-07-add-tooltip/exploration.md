# Exploration: Add Tooltip to bursit-angular

Change: `add-tooltip`
Date: 2026-08-28
Phase: sdd-explore

## Current State

Nothing tooltip-related exists in the repo (grep for `tooltip` across `projects/` returns zero hits). The building blocks a tooltip needs are already in place:

- **CDK is a direct dependency** (`@angular/cdk: ^21.2.14`) and is already the overlay backbone:
  - `modal.service.ts` — service-driven overlays via `Overlay.create()` + `GlobalPositionStrategy` + `ComponentPortal`.
  - `forms/select/select.ts` + `select.html` — directive-driven overlays via `cdk-connected-overlay` with a `ConnectedPosition[]` fallback array, `cdkConnectedOverlayOrigin` (a `viewChild` trigger), and `scrollStrategyOptions.reposition()`.
  - `modal.component.ts` — `A11yModule` + `CdkTrapFocus` for a11y.
- **bursit-ui-tokens ALREADY ships a complete tooltip token set** in `src/components/tooltip.scss` (forwarded by `src/index.scss`, which is wired into Storybook styles in `angular.json` and shipped to consumers via the ng-add schematics `index.css`). No new tokens are needed.
- Storybook `preview.ts` already provides `OverlayModule` globally and a light/dark theme toggle (`bursit-theme` attribute) — tooltip stories get CDK + theming for free.

## Existing Patterns (source of convention)

| Concern | Pattern | Evidence |
|---|---|---|
| Directive API | `[bursit-button], [bursitButton]` dual selector, signal inputs, host class bindings, styles in global `src/styles/_*.scss` | `button/button.directive.ts` |
| Component API | `bursit-*` element selector, standalone, `input()`/`model()` signals, `computed`, co-located `.scss`, OnPush | `avatar/avatar.ts`, `modal/modal.component.ts` |
| Overlay (service) | `Overlay` + `position().global()` + `ComponentPortal` + token-based injector | `modal/modal.service.ts` |
| Overlay (template) | `cdk-connected-overlay` + `[cdkConnectedOverlayOrigin]="trigger"` + `_positions: ConnectedPosition[]` + `reposition()` scroll strategy | `forms/select/select.html`, `select.ts:67-96` |
| A11y wiring | `_wireAria*` helpers that respect user-set attributes; static uid counter | `select.ts:288-311, 49-57` |
| Barrels | Per-feature `index.ts` → `lib/index.ts` → `public-api.ts` | `modal/index.ts`, `lib/index.ts` |
| Tests | In-spec `TestHostComponent`s, TestBed, direct DOM assertions, fake timers where timing matters; real CDK overlay in jsdom (`.cdk-overlay-backdrop` queries) | `modal.component.spec.ts`, `modal.service.spec.ts`, `button.directive.spec.ts` |
| Stories | CSF3 `Meta<T>` + `StoryObj`, `moduleMetadata` decorators, `argTypes` controls, `tags: ['autodocs']`, wrapper trigger component + `argsToTemplate` | `modal.stories.ts`, `button.directive.stories.ts` |
| Tokens in styles | Component styles reference `var(--tooltip-*)` style custom properties; global token import in `angular.json` styles + `styleIncludePaths` in `ng-package.json` | `modal.component.scss`, `ng-package.json` |

## What a Tooltip Needs

1. **Triggers**: hover (mouseenter/mouseleave), focus (focusin/focusout), Escape to dismiss, and a documented touch story (tap → focus for focusable triggers; non-focusable hosts need a future tap-toggle mode).
2. **Positioning**: top/bottom/left/right base positions with automatic flip on viewport overflow (CDK `FlexibleConnectedPositionStrategy` fallback array does this), viewport margin, gap offset, arrow.
3. **Delays**: show delay (~300ms), hide delay (~100ms), timers cancelled on intermediate events and in `ngOnDestroy`.
4. **Arrow**: rotated-square/pseudo-element arrow, sized/colored via existing `--tooltip-arrow-size` / `--tooltip-arrow-color`; panel gets a position class so the arrow orientates correctly; position class must update when CDK flips (`positionChanges`).
5. **Accessibility**: `role="tooltip"` on the panel; `aria-describedby` on the trigger set when shown and restored/removed on hide (never clobber a user-set value — select's `_wireAria*` precedent); APG tooltip pattern (non-interactive, `pointer-events: none` so mouse never enters).
6. **Dismissal**: mouseleave, focusout, Escape (via `overlayRef.keydownEvents()`), detach on destroy.
7. **Disabled state**: `disabled()` input; suppress show/hide when disabled or host has `[disabled]` attribute.
8. **Dynamic content**: content input supports `string | TemplateRef | null`; signal updates propagate to the panel component automatically.

## Recommended Approach

**Attribute directive `[bursitTooltip]` + internal `TooltipPanelComponent` attached via the CDK `Overlay` service with `FlexibleConnectedPositionStrategy` (programmatic `ComponentPortal` path).**

Rationale:

- **Directive, not wrapper component**: matches the `button` directive precedent (`[bursit-button], [bursitButton]` dual selector), is ergonomic on any element (`<button [bursitTooltip]="'Save'">`), and avoids forcing consumers to restructure markup inside a `<bursit-tooltip>` wrapper.
- **Overlay service + `ComponentPortal`, not `cdk-connected-overlay` template**: a directive has no template to host the `cdk-connected-overlay` block (that pattern requires a component, as in select). The service path is already proven in this repo by `modal.service.ts` and mirrors how CDK's own `MatTooltip` works (directive + internal attached component).
- **`FlexibleConnectedPositionStrategy` for flip-on-overflow**: build a 4-position fallback chain (requested position first), add `withViewportMargin(8)` and `scrollStrategies.reposition()` (select precedent) so tooltips survive scroll containers and viewport edges.
- **Internal panel component carries the styles**: like `ModalComponent` inside the overlay, `TooltipPanelComponent` with `styleUrl` and emulated encapsulation renders `role="tooltip"`, the arrow, and consumes `--tooltip-*` tokens. No global stylesheet needed (unlike button, whose styles are global because the host element IS the styled element). Keep the panel out of the public barrel (ComponentPortal only needs the class; ng-packagr exports only what `public-api.ts` re-exports).
- **Packaging fix bundled in**: `projects/bursit-angular/package.json` declares only `@angular/common`/`@angular/core` as peer deps, yet modal and select already import `@angular/cdk` — a latent publishing gap. This change adds more CDK surface, so it should add `@angular/cdk: ^21.0.0` to peerDependencies.

Alternative considered: **`<bursit-tooltip>` wrapper component using `cdk-connected-overlay`** (select pattern). Pros: content projection (`ng-content`) for rich content, simpler arrow/offset math. Cons: clunky API, diverges from the button-directive ergonomics, and the repo has no wrapper-component precedent for augmenting host elements. Rejected for the primary API; a TemplateRef content input covers rich-content needs.

## API Surface Proposal

```ts
@Directive({
  selector: '[bursitTooltip], [bursit-tooltip]',
  // host bindings: class none needed; event wiring in constructor via Renderer2/host listeners
})
export class TooltipDirective {
  content = input<string | TemplateRef<unknown> | null>(null, { alias: 'bursitTooltip' });
  position = input<TooltipPosition>('top');          // 'top' | 'bottom' | 'left' | 'right'
  showDelay = input<number>(300);                    // ms
  hideDelay = input<number>(100);                    // ms
  disabled = input<boolean>(false);
  arrow = input<boolean>(true);
  readonly shown = output<void>();
  readonly hidden = output<void>();
}
```

- Selector mirrors button's dual camel/kebab form.
- The alias `'bursitTooltip'` makes the selector itself the content input (`[bursitTooltip]="'Save'">`).
- Internal `TooltipPanelComponent`: `role="tooltip"`, renders `string` or `TemplateRef` content, position class (`bursit-tooltip-top` etc.), arrow element when `arrow()`.
- Aria wiring: static uid counter (`bursit-tooltip-${n}`, select precedent); on show, set `aria-describedby` on host (append/restore, never overwrite a user value); remove on hide. Escape dismisses via `keydownEvents()`.
- Positions: primary + fallback chain (`top → bottom → left → right`), `withViewportMargin(8)`, `scrollStrategies.reposition()`, `withPush(true)` optional.

## Design Tokens Needed

**None to create** — `bursit-ui-tokens/src/components/tooltip.scss` already defines the full set (available in-app via `angular.json` styles, to consumers via schematics):

- `--tooltip-bg` (neutral-900), `--tooltip-color` (neutral-0), `--tooltip-font-size` (xs), `--tooltip-font-weight`, `--tooltip-line-height`
- `--tooltip-padding-y` / `--tooltip-padding-x`, `--tooltip-border-radius` (radius-sm), `--tooltip-max-width` (12.5rem)
- `--tooltip-shadow` (shadow-md), `--tooltip-transition` + `--tooltip-enter-ease` / `--tooltip-enter-duration`
- `--tooltip-arrow-size`, `--tooltip-arrow-color`
- `--tooltip-z-index` → `--z-index-tooltip: 500` (informational; CDK's `.cdk-overlay-container` manages actual stacking — do not fight it)
- Reduced motion is already handled globally in `_tokens.scss` (durations → 0ms); add a `prefers-reduced-motion` guard in panel SCSS as belt-and-braces (modal precedent).

## Risks & Edge Cases

| Risk | Severity | Mitigation |
|---|---|---|
| **Flip breaks arrow alignment / position class** | Medium | Subscribe to `positionChanges` on the strategy; update panel position class so the arrow re-orients. |
| **Packaging gap: `@angular/cdk` not a peer dep** (pre-existing; tooltip widens it) | Medium | Add `@angular/cdk` to `projects/bursit-angular/package.json` peerDependencies in this change. |
| **SSR** | Low | Event-driven attach only; no `document`/`window` access at construction. CDK Overlay is SSR-safe; select/modal already ship CDK overlays. |
| **Viewport clipping / scroll containers** | Medium | `withViewportMargin` + `scrollStrategies.reposition()`; rely on fallback positions. |
| **Touch devices** (no hover) | Medium | Document focus-trigger behavior; `touchBehavior` tap-toggle is a v2 candidate. Panel is `pointer-events: none` so stray taps never pin it. |
| **Timers leaking / overlay not disposed** | High | Cancel timers and `overlayRef.dispose()` in `ngOnDestroy`; idempotent hide. |
| **aria-describedby clobbering** | Medium | Save/restore prior value; only touch the attribute when this directive owns it. |
| **Nested tooltips / stacked overlays** | Low | CDK container stacking handles z-index; keep tooltips non-interactive so no hover-intent chains form. |
| **Reduced motion** | Low | Token durations zero out globally; panel SCSS guard as backup. |
| **Disabled triggers** | Low | Gate show on `disabled()` and host `[disabled]`. |
| **Review budget** | High | Estimate ~900–1100 changed lines (directive + panel + specs + stories + packaging) — exceeds the 400-line budget; plan chained/stacked PR slices in sdd-tasks (e.g. slice 1: directive + panel + unit tests; slice 2: stories + docs + packaging). |

## Suggested Task Breakdown Sketch

1. **Scaffold + types**: `src/lib/tooltip/` folder, `tooltip-position.type.ts`, `index.ts`, wire `export * from './tooltip'` into `lib/index.ts`.
2. **Panel component**: `tooltip-panel.component.ts` (+ `.scss`) — `role="tooltip"`, string/TemplateRef content, arrow, token styles, position class, reduced-motion guard. Tests: role, content modes, arrow class.
3. **Directive core**: `tooltip.directive.ts` — inputs/outputs, show/hide timers (fake-timer tests), hover/focus/Escape wiring, disabled gating, aria-describedby save/restore.
4. **Overlay integration**: `Overlay` + `FlexibleConnectedPositionStrategy` + fallback positions + viewport margin + `reposition()` scroll strategy + `ComponentPortal` attach/detach + `ngOnDestroy` disposal + `positionChanges` → panel class sync.
5. **Stories**: CSF3 — default hover, focus, positions (4), delays, disabled, TemplateRef content, arrow toggle, dark-mode check. `OverlayModule` already global in `preview.ts`.
6. **Packaging**: add `@angular/cdk` peer dep; verify `npm run build` and `npm run test` (80% lib coverage threshold).

## Ready for Proposal

Yes. The approach is fully determined by existing repo patterns (button directive precedent + modal's `ComponentPortal` overlay precedent + select's positioning precedent), all tokens exist, and the only cross-cutting decision (CDK peer-dep packaging) is a small, well-understood fix to fold in.