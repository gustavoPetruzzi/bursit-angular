# ModalComponent Test Cases

9 tests en 6 categorías. El componente es standalone con `OnPush` y recibe `MODAL_CONFIG` por injection.

## Setup

El `TestBed` requiere `MODAL_CONFIG` en los providers. Para tests de proyección se usa un template wrapper con `<bursit-modal>`.

```typescript
TestBed.configureTestingModule({
  imports: [ModalComponent],
  providers: [
    { provide: MODAL_CONFIG, useValue: { size: ModalSize.SMALL } },
  ],
}).compileComponents();
```

---

## 1. Creación y compilación (2 tests)

### TC-01 — El componente se crea sin errores
- **Dado** `MODAL_CONFIG` provisto con config básico
- **Cuando** se crea el fixture con `detectChanges()`
- **Entonces** `component` es truthy
- **Entonces** no tira errores de compilación ni inyección

### TC-02 — Aplica OnPush
- **Dado** el componente creado
- **Cuando** se inspecciona el `changeDetectorRef` o se verifica que cambios fuera del ciclo no re-renderizan
- **Entonces** usa `ChangeDetectionStrategy.OnPush`

---

## 2. Accesibilidad en el host (2 tests)

### TC-03 — role="dialog"
- **Dado** el componente renderizado
- **Cuando** se obtiene el `nativeElement`
- **Entonces** `getAttribute('role')` es `'dialog'`

### TC-04 — aria-modal="true"
- **Dado** el componente renderizado
- **Cuando** se obtiene el `nativeElement`
- **Entonces** `getAttribute('aria-modal')` es `'true'`

---

## 3. Proyección de slots (4 tests)

Para estos tests se usa un template wrapper:

```html
<bursit-modal>
  <div bursitModalHeader>Header content</div>
  <div bursitModalBody>Body content</div>
  <div bursitModalFooter>Footer content</div>
  <div>Ghost content</div>
</bursit-modal>
```

### TC-05 — Proyecta header en el slot correcto
- **Dado** el wrapper con los 4 hijos
- **Cuando** se renderiza
- **Entonces** el texto `'Header content'` está presente en el DOM del modal
- **Entonces** está dentro del slot `[bursitModalHeader]`

### TC-06 — Proyecta body en el slot correcto
- **Dado** el wrapper con los 4 hijos
- **Cuando** se renderiza
- **Entonces** el texto `'Body content'` está presente en el DOM del modal

### TC-07 — Proyecta footer en el slot correcto
- **Dado** el wrapper con los 4 hijos
- **Cuando** se renderiza
- **Entonces** el texto `'Footer content'` está presente en el DOM del modal

### TC-08 — No renderiza contenido sin selector de slot
- **Dado** el wrapper con los 4 hijos (incluyendo el div `Ghost content` sin selector)
- **Cuando** se renderiza
- **Entonces** el texto `'Ghost content'` NO está presente en el DOM del modal

> Los TC-05 a TC-08 se pueden consolidar en un solo test con un wrapper que proyecte los tres slots y el ghost.

---

## 4. Clases de tamaño (4 tests, uno por variante)

### TC-09 — SMALL agrega bursit-size-small
- **Dado** `MODAL_CONFIG` con `{ size: ModalSize.SMALL }`
- **Cuando** se renderiza
- **Entonces** el host tiene clase `bursit-size-small`

### TC-10 — MEDIUM agrega bursit-size-medium
- **Dado** `MODAL_CONFIG` con `{ size: ModalSize.MEDIUM }`
- **Cuando** se renderiza
- **Entonces** el host tiene clase `bursit-size-medium`

### TC-11 — LARGE agrega bursit-size-large
- **Dado** `MODAL_CONFIG` con `{ size: ModalSize.LARGE }`
- **Cuando** se renderiza
- **Entonces** el host tiene clase `bursit-size-large`

### TC-12 — FULLSCREEN agrega bursit-size-fullscreen
- **Dado** `MODAL_CONFIG` con `{ size: ModalSize.FULLSCREEN }`
- **Cuando** se renderiza
- **Entonces** el host tiene clase `bursit-size-fullscreen`

---

## 5. Valor default del config (1 test)

### TC-13 — Sin size en config no agrega clase de tamaño
- **Dado** `MODAL_CONFIG` con `{}` (sin `size`)
- **Cuando** se renderiza
- **Entonces** el host NO tiene ninguna clase `bursit-size-*`

---

## 6. Focus trap (1 test)

### TC-14 — cdkTrapFocus aplicado
- **Dado** el componente renderizado
- **Cuando** se inspecciona el host
- **Entonces** el `CdkTrapFocus` directive está presente (verificable chequeando que `A11yModule` está disponible y el host tiene los atributos de focus trap, o que el foco cicla entre elementos del modal)
