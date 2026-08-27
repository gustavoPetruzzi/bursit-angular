# ModalComponent Test Cases

9 tests in 6 categories. The component is standalone with `OnPush` and receives `MODAL_CONFIG` by injection.

## Setup

The `TestBed` requires `MODAL_CONFIG` in the providers. Projection tests use a wrapper template with `<bursit-modal>`.

```typescript
TestBed.configureTestingModule({
  imports: [ModalComponent],
  providers: [
    { provide: MODAL_CONFIG, useValue: { size: ModalSize.SMALL } },
  ],
}).compileComponents();
```

---

## 1. Creation and compilation (2 tests)

### TC-01 — The component is created without errors
- **Given** `MODAL_CONFIG` provided with basic config
- **When** the fixture is created with `detectChanges()`
- **Then** `component` is truthy
- **Then** no compilation or injection errors are thrown

### TC-02 — Applies OnPush
- **Given** the created component
- **When** the `changeDetectorRef` is inspected or changes outside the cycle are verified not to re-render
- **Then** it uses `ChangeDetectionStrategy.OnPush`

---

## 2. Host accessibility (2 tests)

### TC-03 — role="dialog"
- **Given** the rendered component
- **When** the `nativeElement` is obtained
- **Then** `getAttribute('role')` is `'dialog'`

### TC-04 — aria-modal="true"
- **Given** the rendered component
- **When** the `nativeElement` is obtained
- **Then** `getAttribute('aria-modal')` is `'true'`

---

## 3. Slot projection (4 tests)

These tests use a wrapper template:

```html
<bursit-modal>
  <div bursitModalHeader>Header content</div>
  <div bursitModalBody>Body content</div>
  <div bursitModalFooter>Footer content</div>
  <div>Ghost content</div>
</bursit-modal>
```

### TC-05 — Projects header into the correct slot
- **Given** the wrapper with the 4 children
- **When** it renders
- **Then** the text `'Header content'` is present in the modal DOM
- **Then** it is inside the `[bursitModalHeader]` slot

### TC-06 — Projects body into the correct slot
- **Given** the wrapper with the 4 children
- **When** it renders
- **Then** the text `'Body content'` is present in the modal DOM

### TC-07 — Projects footer into the correct slot
- **Given** the wrapper with the 4 children
- **When** it renders
- **Then** the text `'Footer content'` is present in the modal DOM

### TC-08 — Does not render content without a slot selector
- **Given** the wrapper with the 4 children (including the `Ghost content` div without a selector)
- **When** it renders
- **Then** the text `'Ghost content'` is NOT present in the modal DOM

> TC-05 to TC-08 can be consolidated into a single test with a wrapper that projects the three slots and the ghost.

---

## 4. Size classes (4 tests, one per variant)

### TC-09 — SMALL adds bursit-size-small
- **Given** `MODAL_CONFIG` with `{ size: ModalSize.SMALL }`
- **When** it renders
- **Then** the host has class `bursit-size-small`

### TC-10 — MEDIUM adds bursit-size-medium
- **Given** `MODAL_CONFIG` with `{ size: ModalSize.MEDIUM }`
- **When** it renders
- **Then** the host has class `bursit-size-medium`

### TC-11 — LARGE adds bursit-size-large
- **Given** `MODAL_CONFIG` with `{ size: ModalSize.LARGE }`
- **When** it renders
- **Then** the host has class `bursit-size-large`

### TC-12 — FULLSCREEN adds bursit-size-fullscreen
- **Given** `MODAL_CONFIG` with `{ size: ModalSize.FULLSCREEN }`
- **When** it renders
- **Then** the host has class `bursit-size-fullscreen`

---

## 5. Default config value (1 test)

### TC-13 — No size in config does not add a size class
- **Given** `MODAL_CONFIG` with `{}` (no `size`)
- **When** it renders
- **Then** the host has NO `bursit-size-*` class

---

## 6. Focus trap (1 test)

### TC-14 — cdkTrapFocus applied
- **Given** the rendered component
- **When** the host is inspected
- **Then** the `CdkTrapFocus` directive is present (verifiable by checking that `A11yModule` is available and the host has the focus trap attributes, or that focus cycles between modal elements)