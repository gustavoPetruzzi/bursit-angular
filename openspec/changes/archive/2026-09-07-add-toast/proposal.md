# Proposal: Toast/Snackbar Component

**Change**: `add-toast`
**Status**: Proposed
**Created**: 2026-09-04

## Intent

bursit-angular has no notification primitive. Teams need a way to give users transient feedback (action success, errors, warnings, tips) without blocking interaction. This adds a Service + Container toast system following the proven ModalService/CDK Overlay pattern already in the codebase.

## Scope

### In Scope
- `ToastService` — imperative API: `success()`, `error()`, `warning()`, `info()`, `show()`
- `ToastRef` — dismiss control + `afterClosed()` observable
- `ToastContainerComponent` — position-aware overlay container managing stacking
- `ToastItemComponent` — single toast rendering with type styling, close button, ARIA
- 4 toast types: success, error, warning, info
- 6 positions: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
- Auto-dismiss with configurable duration + pause on hover
- Manual dismiss + `closeAll()`
- Enter/leave CSS transitions with reduced-motion support
- ARIA: `role="status"` (info/success), `role="alert"` (error/warning), `aria-live`
- New design tokens: `--toast-gap`, `--toast-exit-duration`, `--toast-exit-ease`, `--toast-icon-size`, `--toast-close-size`, `--toast-position-offset`
- Fix `--toast-z-index` (currently points to `--z-index-tooltip/500`, should be `--z-index-toast/600`)
- Storybook stories for all positions and types
- Jest unit tests with fake timers

### Out of Scope
- Custom toast templates/content projection (v2)
- Queue/priority system (v2)
- Action buttons inside toasts (v2)
- RTL layout support (v2)
- SSR rendering of toast DOM (v2 — guard only)

## Capabilities

### New Capabilities
- `toast-notification`: Core toast service, container, item component, types, positions, auto-dismiss, stacking, ARIA

### Modified Capabilities
None — no existing spec-level behavior changes.

## Approach

Service + Container (Angular Material MatSnackBar pattern):

1. `ToastService` (providedIn: 'root', SSR-guarded) creates toast config, manages timer state, holds signal-based toast list
2. `ToastContainerComponent` — one per position, attached via `Overlay.create()` + `positionStrategy`. Computes toasts for its position, renders `ToastItemComponent` list via `@for`
3. `ToastItemComponent` — signal inputs for toast data, handles hover pause/resume, close button, ARIA attributes
4. `ToastRef` — returned to caller, exposes `dismiss()` and `afterClosed()`
5. Timer management: timer map with pause/resume on hover, cleanup on dismiss/destroy
6. Max visible per position: 5 (oldest auto-dismissed when exceeded)
7. Exit animation: add exit class → wait exit duration → remove from DOM

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `projects/bursit-angular/src/lib/toast/` | New | All toast source files |
| `projects/bursit-angular/src/public-api.ts` | Modified | Barrel export toast service, ref, types |
| `projects/bursit-angular/src/styles/` | Modified | New `_toast.scss` entry point |
| bursit-ui-tokens | Modified | Fix z-index, add missing tokens (separate chore PR) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `--toast-z-index` wrong value in tokens | High | Fix in bursit-ui-tokens first (separate chore) |
| Timer memory leaks on rapid dismiss | Medium | Cleanup timer map on every dismiss path; test with fake timers |
| CDK Overlay stacking order | Low | One OverlayRef per container (not per toast); z-index via token |
| SSR crash (DOM access) | Medium | `isPlatformBrowser` guard on service methods, like BursitThemeService |

## Rollback Plan

1. Remove `projects/bursit-angular/src/lib/toast/` directory
2. Remove toast barrel export from `public-api.ts`
3. Remove `_toast.scss` from styles
4. Revert bursit-ui-tokens changes (token additions + z-index fix)
5. `npm run build && npm run test` to verify clean state

## Dependencies

- CDK Overlay (already in project)
- bursit-ui-tokens (existing dependency)
- No new external dependencies

## Success Criteria

- [ ] `toastService.success('Test')` renders a positioned toast with auto-dismiss
- [ ] Multiple toasts stack correctly per position (max 5)
- [ ] Pause on hover stops/resumes timer
- [ ] Manual dismiss via `ref.dismiss()` and close button
- [ ] `closeAll()` clears all active toasts
- [ ] ARIA roles and aria-live correct for each type
- [ ] Reduced motion preference disables animations
- [ ] All tests pass (`npm run test`), coverage ≥80% for toast files
- [ ] Storybook stories render all 6 positions × 4 types
- [ ] SSR guard prevents DOM access in non-browser environments