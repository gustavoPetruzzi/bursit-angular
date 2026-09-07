# Exploration: Toast/Snackbar Component

**Created**: 2026-09-04

## Summary

Toast/Snackbar is a core notification primitive missing from bursit-angular. Explored the existing architecture (ModalService, Tooltip directive, CDK Overlay usage, design tokens) and the big-library approaches (Angular Material MatSnackBar, PrimeNG p-toast, ngx-toastr) to settle on Service + Container as the architecture.

## Key Findings

1. **ModalService is the architectural reference**: `ModalService.open()` → `ComponentPortal` → `OverlayRef` → `ModalRef<T>` with `afterClosed()`. The toast service should mirror this exact pattern.

2. **CDK Overlay already in project deps** — no new dependency needed. Tooltip directive proves `flexibleConnectedTo`; toast needs `global()` positioning instead (fixed viewport positions).

3. **Design tokens mostly exist**: `--toast-*` tokens (bg, shadow, border, padding, min/max-width, enter animation, z-index) already ship in bursit-ui-tokens. Missing: `--toast-gap`, `--toast-exit-duration`, `--toast-exit-ease`, `--toast-icon-size`, `--toast-close-size`, `--toast-position-offset`.

4. **Token bug found**: `--toast-z-index` points to `--z-index-tooltip` (500) instead of `--z-index-toast` (600). Must fix in bursit-ui-tokens.

5. **Big libraries use Service + Container**: Angular Material (MatSnackBar), PrimeNG (MessageService + p-toast), ngx-toastr all centralize stacking in a container component per position. This is the industry-standard approach.

6. **Signals over RxJS**: Angular 21 project standard — `signal<ToastState[]>` + `computed` per-position views replaces BehaviorSubject patterns.

7. **SSR guard needed**: `isPlatformBrowser` check per service method, like `BursitThemeService`. Toasts make no sense on the server.

8. **Timer management must live in the service**: Single cleanup point for `dismiss()`, `closeAll()`, `destroy()`. Pause/resume on hover requires tracking remaining time.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Service + Container | Industry standard (MatSnackBar, p-toast), follows ModalService pattern |
| Overlay strategy | One per position | Fewer overlays, stacking managed via signal array |
| State | Signals | Angular 21 native, OnPush compatible |
| Animations | CSS class toggle + transition | Matches ModalRef pattern, no Angular animations module |
| Token PR | Separate chore | Keep toast PR focused on TS/CSS implementation |
| Max visible | 5 per position | Configurable via ToastConfig |

## Out of Scope (Explored, Deferred)

- Custom templates/content projection (v2)
- Queue/priority system (v2)
- Action buttons in toasts (v2)
- RTL support (v2)
- SSR DOM rendering (v2)