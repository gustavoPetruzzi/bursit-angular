# Design: Toast/Snackbar Notification Component

## Technical Approach

Service + Container architecture mirroring `ModalService`/CDK Overlay pattern. `ToastService` (providedIn: 'root') holds signal-based state, creates `ToastRef` per toast, and attaches one `ToastContainerComponent` overlay per active position. Each container renders a `@for` list of `ToastItemComponent` instances. Timer management lives in the service (not the component) for reliable cleanup. CSS transitions handle enter/exit via class toggles — no Angular animations module.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| Timer location | Service vs Component | Service = single cleanup point; Component = tighter coupling to DOM lifecycle | **Service** — mirrors ModalService ownership model, easier `closeAll()` + `destroy()` |
| Overlay per toast vs per container | One OverlayRef/toast vs one OverlayRef/position | Per-toast = simpler but N overlays; Per-container = one overlay, DOM managed inside | **Per-container** — fewer overlays, stacking managed via signal array |
| State model | BehaviorSubject vs signals | BehaviorSubject = RxJS familiar; signals = Angular 21 native | **Signals** — `signal<ToastState[]>` with `computed` for per-position views |
| Animation engine | CSS @keyframes vs class toggle + transition | Keyframes = declarative but harder to sequence exit-then-remove; class toggle = explicit control | **Class toggle** — matches ModalRef `_animateAndComplete` pattern exactly |
| SSR strategy | Guard all methods vs NoOp service | Guard = one check per method; NoOp = separate implementation | **Guard** — matches `BursitThemeService` pattern, single class |

## Data Flow

```
Consumer ──→ ToastService.show() ──→ Creates ToastState + ToastRef
                │
                ├─── signal<ToastState[]> updated ──→ computed per-position views
                │                                        │
                │                                        └──→ ToastContainerComponent @for renders
                │                                              └──→ ToastItemComponent (inputs)
                │
                └─── Timer started (setTimeout) ──→ pause/resume on hover events
                                                       │
                                                       └──→ on expiry: ToastRef._animateAndComplete()
                                                             └──→ exit class → timeout → overlay detach
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `lib/toast/toast.types.ts` | Create | `ToastType`, `ToastPosition`, `ToastConfig`, `ToastState` interfaces + defaults |
| `lib/toast/toast-ref.ts` | Create | `ToastRef` class — `dismiss()`, `afterClosed()`, exit animation wiring |
| `lib/toast/toast.service.ts` | Create | `ToastService` — signal state, timer Map, show/success/error/warning/info/closeAll/destroy |
| `lib/toast/toast-container.component.ts` | Create | Per-position overlay container — computes position list, renders items |
| `lib/toast/toast-item.component.ts` | Create | Single toast — signal inputs, close button, ARIA, hover events, icon per type |
| `lib/toast/index.ts` | Create | Barrel: export service, ref, types, container, item |
| `lib/index.ts` | Modify | Add `export * from './toast'` |
| `styles/_toast.scss` | Create | Container positioning, item enter/exit transitions, type variants, reduced-motion |
| `styles/_index.scss` | Modify | Add `@forward 'toast'` |

## Interfaces / Contracts

```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastConfig {
  type?: ToastType;           // default: 'info'
  position?: ToastPosition;   // default: 'bottom-right'
  duration?: number;          // ms, default per-type; 0 = manual only
  dismissible?: boolean;      // default: true
  pauseOnHover?: boolean;     // default: true
  maxVisible?: number;        // default: 5
}

interface ToastState extends Required<ToastConfig> {
  id: string;
  message: string;
  entering: boolean;
  exiting: boolean;
}

class ToastRef {
  dismiss(): void;
  afterClosed(): Observable<void>;
}
```

**Default durations per type**: success=5000, error=8000, warning=5000, info=4000. Max per position: 5 (configurable via `ToastConfig.maxVisible`).

## CDK Overlay Strategy

One `OverlayRef` per active position (lazily created). Position mapping:

| Position | `positionStrategy` |
|----------|--------------------|
| `top-right` | `global().top().right()` with `--toast-position-offset` margin |
| `top-left` | `global().top().left()` |
| `bottom-right` | `global().bottom().right()` |
| `bottom-left` | `global().bottom().left()` |
| `top-center` | `global().top().centerHorizontally()` |
| `bottom-center` | `global().bottom().centerHorizontally()` |

`scrollStrategy: reposition()` — toasts follow viewport on scroll. No backdrop. z-index from `--toast-z-index` token.

## Timer Architecture

```
Map<string, { timerId, remaining, total, pausedAt }>
```

- `show()` → start timer, store in Map
- `mouseenter` → `clearTimeout`, record remaining
- `mouseleave` → restart timer with remaining
- `dismiss()` / `closeAll()` → `clearTimeout`, delete from Map
- `destroy()` → iterate Map, clear all, complete subjects

## Animation Plan

**Enter**: Toast mounts with `bursit-toast-enter` class (slide-in + fade-in), removed after `--toast-enter-duration`.

**Exit**: Service sets `exiting: true` on ToastState → component adds `bursit-toast-exit` class → `setTimeout(--toast-exit-duration)` → remove from signal array. Mirrors `ModalRef._animateAndComplete` exactly.

**Reduced motion**: `@media (prefers-reduced-motion: reduce)` → `animation: none` + `transition: none`.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit: service | show/dismiss/closeAll/timer logic | TestBed + fake timers (`jest.useFakeTimers()`), manual `OverlayContainer` cleanup |
| Unit: ref | dismiss, afterClosed, idempotent close | Direct instantiation, subscribe to `afterClosed()` |
| Unit: container | Position rendering, max visible enforcement | TestBed with `OverlayModule`, assert DOM per position |
| Unit: item | ARIA roles, close button, hover events | TestBed, trigger events, assert attributes |
| Integration | Full lifecycle: show → hover pause → dismiss | TestBed + fake timers, simulate hover, assert timer behavior |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Purely additive. Token additions (`--toast-gap`, exit tokens) land in a separate chore PR in bursit-ui-tokens.

## Open Questions

- [ ] Should `maxVisible` be a global default in `ToastConfig` or per-position? (Design assumes global default of 5; user confirmed separate token PR)
- [ ] Token additions land as separate chore PR (user confirmed)