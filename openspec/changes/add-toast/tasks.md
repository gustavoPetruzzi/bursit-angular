# Tasks: Toast/Snackbar Notification Component

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 350–450 (authored TS/CSS + tests, no tokens) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | single PR with size:exception |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Types, ToastRef, ToastService core | PR 1 | `npx jest --testPathPattern=toast` | N/A (unit tests only) | Remove `lib/toast/` directory |
| 2 | Container + Item components + SCSS + Stories | PR 1 | `npx jest --testPathPattern=toast && npm run storybook` | Storybook visual check | Remove components + styles |

## Phase 1: Types & Config

- [ ] 1.1 Create `projects/bursit-angular/src/lib/toast/toast.types.ts` — define `ToastType`, `ToastPosition`, `ToastConfig`, `ToastState` interfaces + `TOAST_DEFAULTS` constant
- [ ] 1.2 Create `projects/bursit-angular/src/lib/toast/toast.types.spec.ts` — verify default values and type exports compile correctly

## Phase 2: ToastRef (RED → GREEN)

- [ ] 2.1 Create `projects/bursit-angular/src/lib/toast/toast-ref.spec.ts` — RED: write failing tests for `dismiss()`, `afterClosed()`, idempotent close, exit animation wiring
- [ ] 2.2 Create `projects/bursit-angular/src/lib/toast/toast-ref.ts` — GREEN: implement `ToastRef` class with `dismiss()`, `afterClosed()`, `_animateAndComplete()`, `_setupExit()` following ModalRef pattern
- [ ] 2.3 Verify `npx jest --testPathPattern=toast-ref` passes — REFACTOR: extract EXIT_ANIMATION_DURATION to types if needed

## Phase 3: ToastService (RED → GREEN)

- [ ] 3.1 Create `projects/bursit-angular/src/lib/toast/toast.service.spec.ts` — RED: write failing tests for `show()`, `success/error/warning/info()`, `closeAll()`, `destroy()`, timer pause/resume, max visible enforcement, SSR guard
- [ ] 3.2 Create `projects/bursit-angular/src/lib/toast/toast.service.ts` — GREEN: implement `ToastService` with signal state, timer Map, CDK Overlay per-position, SSR `isPlatformBrowser` guard
- [ ] 3.3 Verify `npx jest --testPathPattern=toast-service` passes — REFACTOR: extract timer helpers if methods grow too long

## Phase 4: ToastItemComponent (RED → GREEN)

- [ ] 4.1 Create `projects/bursit-angular/src/lib/toast/toast-item.component.spec.ts` — RED: write failing tests for ARIA roles (`role="status"` vs `role="alert"`), close button click, hover events, icon rendering per type
- [ ] 4.2 Create `projects/bursit-angular/src/lib/toast/toast-item.component.ts` — GREEN: implement component with signal inputs, `@HostListener` for mouseenter/mouseleave, close button, ARIA attributes
- [ ] 4.3 Verify `npx jest --testPathPattern=toast-item` passes

## Phase 5: ToastContainerComponent (RED → GREEN)

- [ ] 5.1 Create `projects/bursit-angular/src/lib/toast/toast-container.component.spec.ts` — RED: write failing tests for position rendering, `@for` list of items, empty state
- [ ] 5.2 Create `projects/bursit-angular/src/lib/toast/toast-container.component.ts` — GREEN: implement component with CDK `@ComponentPortal`, signal inputs for position + toasts array, `@for` render loop
- [ ] 5.3 Verify `npx jest --testPathPattern=toast-container` passes

## Phase 6: Barrel Exports

- [ ] 6.1 Create `projects/bursit-angular/src/lib/toast/index.ts` — export `ToastService`, `ToastRef`, `ToastType`, `ToastPosition`, `ToastConfig`, `ToastState`
- [ ] 6.2 Modify `projects/bursit-angular/src/lib/index.ts` — add `export * from './toast'`
- [ ] 6.3 Verify `npm run build` compiles without errors

## Phase 7: SCSS Styling

- [ ] 7.1 Create `projects/bursit-angular/src/styles/_toast.scss` — container positioning (6 positions), item enter/exit transitions (`bursit-toast-enter`, `bursit-toast-exit`), type variants (success/error/warning/info), close button, `@media (prefers-reduced-motion: reduce)`
- [ ] 7.2 Modify `projects/bursit-angular/src/styles/_index.scss` — add `@forward 'toast'`
- [ ] 7.3 Verify `npm run build` compiles SCSS without errors

## Phase 8: Storybook Stories

- [ ] 8.1 Create `projects/bursit-angular/src/lib/toast/toast.stories.ts` — stories for all 6 positions × 4 types, auto-dismiss demo, manual dismiss demo

## Phase 9: Integration Test

- [ ] 9.1 Add integration test to `toast.service.spec.ts` — full lifecycle: `show()` → hover pause → leave resume → auto-dismiss → verify `afterClosed()` emits
- [ ] 9.2 Run `npm run test` — verify all toast tests pass, coverage ≥80% for toast files
- [ ] 9.3 Run `npm run build` — verify library builds cleanly with toast exports

## Phase 10: Cleanup

- [ ] 10.1 Verify `public-api.ts` re-exports toast via `lib/index.ts` chain (no direct edit needed)
- [ ] 10.2 Run `npm run storybook` — visual check all stories render correctly

---

## Test Summary

| Phase | Tests | Type |
|-------|-------|------|
| Phase 1 | 2 | Types compile check |
| Phase 2 | 6 | ToastRef unit |
| Phase 3 | 14 | ToastService unit |
| Phase 4 | 10 | ToastItemComponent unit |
| Phase 5 | 6 | ToastContainerComponent unit |
| Phase 9 | 1 | Integration lifecycle |
| **Total** | **39** | |

## File Summary

| Phase | Files Created | Files Modified |
|-------|---------------|----------------|
| Phase 1 | 2 | 0 |
| Phase 2 | 2 | 0 |
| Phase 3 | 2 | 0 |
| Phase 4 | 2 | 0 |
| Phase 5 | 2 | 0 |
| Phase 6 | 1 | 1 |
| Phase 7 | 1 | 1 |
| Phase 8 | 1 | 0 |
| **Total** | **13** | **2** |

## Implementation Order

1. **Types first** — everything depends on `ToastType`, `ToastPosition`, `ToastConfig`, `ToastState`
2. **ToastRef second** — service creates refs, components consume them
3. **ToastService third** — core logic, timer management, CDK Overlay orchestration
4. **Components fourth** — item and container depend on types + ref + service
5. **Exports fifth** — wire everything to public API
6. **Styles sixth** — visual layer, no TS dependencies
7. **Stories last** — need working components to render