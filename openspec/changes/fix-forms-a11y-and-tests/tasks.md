# Tasks — fix-forms-a11y-and-tests (Phase 1: Test Fix)

## Forecast

- **Decision needed before apply**: No
- **Chained PRs recommended**: No
- **400-line budget risk**: Low (Phase 1 changes approximately 20–30 lines, single file)

## Phase 1 — Fix `createWithControl()` Test Infrastructure

### 1.1 Rewire `createWithControl()` to use real DI

- [x] **1.1.1** Remove `const nativeElement = document.createElement('input')` declaration (line 51)
- [x] **1.1.2** Remove `TestBed.overrideProvider(ElementRef, { useValue: new ElementRef(nativeElement) })` (line 53)
- [x] **1.1.3** Remove `TestBed.overrideProvider(NgControl, { useValue: null })` (line 54)
- [x] **1.1.4** Update the return statement to use `dirEl.nativeElement` instead of the local `nativeElement` variable

**File**: `projects/bursit-angular/src/lib/forms/input/input.directive.spec.ts`

### 1.2 Fix "should mark invalid after control is touched" test (line 92)

- [x] **1.2.1** Replace `nativeElement` references with `dirEl.nativeElement` in the test body
- [x] **1.2.2** Verify the test passes: `directive.invalid()` returns `true` after `control.markAsTouched()` and microtask flush

**File**: `projects/bursit-angular/src/lib/forms/input/input.directive.spec.ts`

### 1.3 Fix "should NOT mark invalid after touch if default" test (line 120)

- [x] **1.3.1** Verify the test passes after rewiring — this test uses only `control.markAsTouched()` and `directive.invalid()`, both resolved correctly once `NgControl` is no longer overridden

**File**: `projects/bursit-angular/src/lib/forms/input/input.directive.spec.ts`

### 1.4 Verify accidentally-passing tests still pass

- [x] **1.4.1** Run "should NOT mark invalid initially" test (line 81) — confirm `directive.invalid()` returns `false` with real DI
- [x] **1.4.2** Run "should NOT mark invalid after touch if field has a valid value" test (line 133) — confirm `directive.invalid()` returns `false` with real DI
- [x] **1.4.3** Fix any regressions if these tests expose behavior differences with real DI

**File**: `projects/bursit-angular/src/lib/forms/input/input.directive.spec.ts`

### 1.5 Run full forms test suite

- [x] **1.5.1** Run `npm run test -- --testPathPattern=input.directive.spec` — all 4 tests MUST pass
- [x] **1.5.2** Run `npm run test` — confirm no regressions in the full test suite
