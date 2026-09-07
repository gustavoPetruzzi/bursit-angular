# Toast/Snackbar Notification — Specification

## Purpose

Transient, non-blocking user feedback system. Service + Container architecture using CDK Overlay. Adds `ToastService`, `ToastRef`, `ToastContainerComponent`, and `ToastItemComponent` to bursit-angular.

## Requirements

### Requirement: REQ-toast-01 — Service API

`ToastService` SHALL provide `success()`, `error()`, `warning()`, `info()`, and `show(message, config?)`. Each convenience method defaults `type` accordingly. Service SHALL be `providedIn: 'root'`.

#### Scenario: SCENARIO-toast-01 — Show success toast

- GIVEN ToastService is injected
- WHEN `toastService.success('Saved!')` is called
- THEN a toast with type=success renders at default position
- AND auto-dismiss fires after default duration (5000ms)

#### Scenario: SCENARIO-toast-02 — Show with custom config

- GIVEN ToastService is injected
- WHEN `toastService.show('Msg', { type: 'error', duration: 8000, position: 'top-left' })` is called
- THEN a toast renders at top-left with duration 8000ms

#### Scenario: SCENARIO-toast-03 — SSR guard

- GIVEN service runs in a non-browser platform
- WHEN any toast method is called
- THEN no DOM access occurs and the call returns a no-op ref

### Requirement: REQ-toast-02 — ToastRef Lifecycle

`ToastRef` SHALL expose `dismiss()` and `afterClosed(): Observable`. `afterClosed` SHALL emit the dismissal reason then complete.

#### Scenario: SCENARIO-toast-04 — Manual dismiss via ref

- GIVEN a toast is visible and `ref` is returned from `show()`
- WHEN `ref.dismiss()` is called
- THEN the toast exits with leave animation
- AND `afterClosed()` emits

#### Scenario: SCENARIO-toast-05 — afterClosed on auto-dismiss

- GIVEN a toast with 5000ms duration
- WHEN auto-dismiss timer completes
- THEN `afterClosed()` emits without manual intervention

### Requirement: REQ-toast-03 — Toast Types

Four types: `success`, `error`, `warning`, `info`. Each SHALL render with distinct visual styling via CSS custom properties and appropriate icon.

#### Scenario: SCENARIO-toast-06 — Each type renders distinct visuals

- GIVEN toasts of each type are created
- WHEN they appear in the DOM
- THEN each has type-specific CSS class, icon, and ARIA role

### Requirement: REQ-toast-04 — Toast Positions

Six positions: `top-right`, `top-left`, `bottom-right`, `bottom-left`, `top-center`, `bottom-center`. Default: `bottom-right`.

#### Scenario: SCENARIO-toast-07 — Toast renders at specified position

- GIVEN `position: 'top-center'` in config
- WHEN toast is shown
- THEN overlay attaches at top-center of viewport

#### Scenario: SCENARIO-toast-08 — Default position fallback

- GIVEN no position specified
- WHEN `show('Msg')` is called
- THEN toast renders at bottom-right

### Requirement: REQ-toast-05 — Stacking

Multiple toasts at the same position SHALL stack vertically with `--toast-gap` spacing. Max visible per position: 5 (configurable via `ToastConfig`). Oldest auto-dismissed when max exceeded.

#### Scenario: SCENARIO-toast-09 — Stacking within limit

- GIVEN 3 toasts at bottom-right
- WHEN a 4th is created
- THEN all 4 are visible, stacked vertically

#### Scenario: SCENARIO-toast-10 — Exceed max visible

- GIVEN 5 toasts at bottom-right (max)
- WHEN a 6th is created
- THEN the oldest toast is dismissed
- AND the new toast renders at the stack edge

### Requirement: REQ-toast-06 — Auto-Dismiss Timer

Default durations: success=5000ms, error=8000ms, warning=5000ms, info=4000ms. Configurable via `duration` option. Timer SHALL be pausable.

#### Scenario: SCENARIO-toast-11 — Pause on hover

- GIVEN a toast with running auto-dismiss timer
- WHEN user hovers over the toast
- THEN timer pauses
- AND when mouse leaves, timer resumes from remaining time

#### Scenario: SCENARIO-toast-12 — Zero duration disables auto-dismiss

- GIVEN `duration: 0` in config
- WHEN toast is shown
- THEN toast remains until manually dismissed

### Requirement: REQ-toast-07 — Manual Dismiss

Toasts SHALL support dismissal via `ref.dismiss()`, close button, and `toastService.closeAll()`.

#### Scenario: SCENARIO-toast-13 — Close button dismiss

- GIVEN a dismissible toast is visible
- WHEN the close button is clicked
- THEN the toast exits with leave animation

#### Scenario: SCENARIO-toast-14 — closeAll

- GIVEN 3 active toasts across positions
- WHEN `toastService.closeAll()` is called
- THEN all toasts exit simultaneously

### Requirement: REQ-toast-08 — Enter/Exit Animations

Enter: slide-in from position edge. Exit: fade-out + slide. Duration and easing from tokens. `prefers-reduced-motion: reduce` SHALL disable animations.

#### Scenario: SCENARIO-toast-15 — Reduced motion respected

- GIVEN OS has reduced motion enabled
- WHEN a toast enters/exits
- THEN no animation plays (instant appear/disappear)

### Requirement: REQ-toast-09 — Accessibility

Success/info toasts: `role="status"`, `aria-live="polite"`. Error/warning toasts: `role="alert"`, `aria-live="assertive"`. Close button SHALL have `aria-label="Close notification"`.

#### Scenario: SCENARIO-toast-16 — Screen reader announces error toast

- GIVEN a toast with type=error
- WHEN it renders in the DOM
- THEN it has `role="alert"` and `aria-live="assertive"`

#### Scenario: SCENARIO-toast-17 — Close button accessible

- GIVEN a visible toast
- WHEN user focuses the close button
- THEN it is keyboard-focusable with visible focus ring
- AND pressing Enter/Space triggers dismiss

### Requirement: REQ-toast-10 — Design Tokens

Existing tokens used: `--toast-bg`, `--toast-shadow`, `--toast-border-*`, `--toast-padding`, `--toast-min-width`, `--toast-max-width`, `--toast-enter-ease`, `--toast-enter-duration`, `--toast-z-index`. New tokens required: `--toast-gap`, `--toast-exit-duration`, `--toast-exit-ease`, `--toast-icon-size`, `--toast-close-size`, `--toast-position-offset`.

#### Scenario: SCENARIO-toast-18 — Token usage (table-driven)

**New tokens added to bursit-ui-tokens:**

| Token | Default | Purpose |
|-------|---------|---------|
| `--toast-gap` | `var(--space-sm)` | Gap between stacked toasts |
| `--toast-exit-duration` | `var(--duration-fast)` | Exit animation duration |
| `--toast-exit-ease` | `var(--ease-in)` | Exit animation easing |
| `--toast-icon-size` | `1.25rem` | Type icon size |
| `--toast-close-size` | `1.5rem` | Close button size |
| `--toast-position-offset` | `var(--space-lg)` | Distance from viewport edge |

**Fix:** `--toast-z-index` MUST point to `--z-index-toast/600` (not `--z-index-tooltip/500`).

## Out of Scope (v2)

- Custom toast templates / content projection
- Queue/priority system
- Action buttons inside toasts
- RTL layout support
- SSR rendering of toast DOM (guard only in v1)