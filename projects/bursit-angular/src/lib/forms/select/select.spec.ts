import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { Select } from './select';
import { Option } from '../option/option';
import { FormFieldTypes } from '../form-field/form-field-types.enum';

interface TestOptionConfig {
  value: string;
  label: string;
  disabled: boolean;
}

// ---------------------------------------------------------------------------
// Test host — wraps Select inside a reactive form
// ---------------------------------------------------------------------------

@Component({
  template: `
    <bursit-select
      [formControl]="control"
      [placeholder]="placeholder()"
      [required]="required()"
      [floatingLabel]="floatingLabel()"
    />
  `,
  imports: [ReactiveFormsModule, Select],
})
class TestHostComponent {
  control = new FormControl<string | null>(null);
  placeholder = signal('Choose an option');
  required = signal(false);
  floatingLabel = signal(false);
}

@Component({
  template: `
    <bursit-select [formControl]="control">
      @for (opt of options(); track opt.value) {
        <bursit-option [value]="opt.value" [disabled]="opt.disabled">
          {{ opt.label }}
        </bursit-option>
      }
    </bursit-select>
  `,
  imports: [ReactiveFormsModule, Select, Option],
})
class OptionsTestHostComponent {
  control = new FormControl<string | null>(null);
  options = signal<TestOptionConfig[]>([
    { value: 'a', label: 'Alpha', disabled: false },
    { value: 'b', label: 'Beta', disabled: true },
    { value: 'c', label: 'Gamma', disabled: false },
  ]);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setup(overrides?: { required?: boolean; floatingLabel?: boolean }) {
  TestBed.configureTestingModule({
    imports: [TestHostComponent],
  });

  const fixture = TestBed.createComponent(TestHostComponent);
  const host = fixture.componentInstance;

  if (overrides?.required) host.required.set(true);
  if (overrides?.floatingLabel) host.floatingLabel.set(true);

  fixture.detectChanges();

  const selectDebug = fixture.debugElement.query(By.directive(Select));
  const select: Select = selectDebug.componentInstance;

  return { fixture, host, select, selectEl: selectDebug.nativeElement as HTMLElement };
}


function setupWithOptions(overrides?: {
  options?: TestOptionConfig[];
}) {
  TestBed.configureTestingModule({
    imports: [OptionsTestHostComponent],
  });

  const fixture = TestBed.createComponent(OptionsTestHostComponent);
  const host = fixture.componentInstance;

  if (overrides?.options) host.options.set(overrides.options);

  fixture.detectChanges();

  const selectDebug = fixture.debugElement.query(By.directive(Select));
  const select: Select = selectDebug.componentInstance;
  const selectEl = selectDebug.nativeElement as HTMLElement;
  const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;

  return { fixture, host, select, selectEl, trigger };
}

function pressKey(trigger: HTMLElement, key: string): void {
  trigger.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

function openDropdown(fixture: ComponentFixture<OptionsTestHostComponent>, trigger: HTMLElement): void {
  trigger.click();
  fixture.detectChanges();
  fixture.detectChanges();
}

function activeDescendantId(trigger: HTMLElement): string | null {
  return trigger.getAttribute('aria-activedescendant');
}

function renderedOptionIdByLabel(label: string): string | undefined {
  const match = Array.from(document.querySelectorAll('bursit-option')).find(
    (el) => el.textContent?.trim() === label,
  );
  return match?.id;
}

// ---------------------------------------------------------------------------
// Tests — PR 1: Foundation + Component Core (RED)
// ---------------------------------------------------------------------------

describe('Select — PR 1 (Foundation)', () => {
  // -----------------------------------------------------------------------
  // 1. Creation
  // -----------------------------------------------------------------------

  it('should create', () => {
    const { select } = setup();
    expect(select).toBeTruthy();
  });

  // -----------------------------------------------------------------------
  // 2. Placeholder
  // -----------------------------------------------------------------------

  it('should render placeholder text when no value is selected', () => {
    const { selectEl } = setup();

    const placeholder = selectEl.querySelector('.bursit-select-placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder?.textContent?.trim()).toBe('Choose an option');
  });

  it('should NOT show placeholder when a value is selected', () => {
    const { host, fixture, selectEl } = setup();

    host.control.setValue('option-a');
    fixture.detectChanges();

    const placeholder = selectEl.querySelector('.bursit-select-placeholder');
    expect(placeholder).toBeFalsy();
  });

  // -----------------------------------------------------------------------
  // 3. Disabled
  // -----------------------------------------------------------------------

  it('should apply disabled attribute and class when control is disabled', () => {
    const { host, fixture, selectEl } = setup();

    host.control.disable();
    fixture.detectChanges();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
    expect(selectEl.classList.contains('bursit-select-disabled')).toBe(true);
  });

  it('should NOT be disabled by default', () => {
    const { selectEl } = setup();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-disabled')).toBeNull();
    expect(selectEl.classList.contains('bursit-select-disabled')).toBe(false);
  });

  // -----------------------------------------------------------------------
  // 4. Focused signal
  // -----------------------------------------------------------------------

  it('should set focused signal to true on trigger focus', () => {
    const { select, selectEl } = setup();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new Event('focus'));

    expect(select.focused()).toBe(true);
  });

  it('should set focused signal to false on trigger blur', () => {
    const { select, selectEl } = setup();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new Event('focus'));
    trigger.dispatchEvent(new Event('blur'));

    expect(select.focused()).toBe(false);
  });

  // -----------------------------------------------------------------------
  // 5. Hovered signal
  // -----------------------------------------------------------------------

  it('should set hovered signal to true on mouseenter', () => {
    const { select, selectEl } = setup();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new Event('mouseenter'));

    expect(select.hovered()).toBe(true);
  });

  it('should set hovered signal to false on mouseleave', () => {
    const { select, selectEl } = setup();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new Event('mouseenter'));
    trigger.dispatchEvent(new Event('mouseleave'));

    expect(select.hovered()).toBe(false);
  });

  // -----------------------------------------------------------------------
  // 6. FormFieldControl contract
  // -----------------------------------------------------------------------

  it('should expose type = FormFieldTypes.SELECT', () => {
    const { select } = setup();
    expect(select.type).toBe(FormFieldTypes.SELECT);
  });

  it('should expose required signal from input', () => {
    const { select } = setup({ required: true });
    expect(select.required()).toBe(true);
  });

  it('should expose floatingLabel signal from input', () => {
    const { select } = setup({ floatingLabel: true });
    expect(select.floatingLabel()).toBe(true);
  });

  // -----------------------------------------------------------------------
  // 7. NgControl injection
  // -----------------------------------------------------------------------

  it('should inject NgControl when used with formControl', () => {
    const { select, host } = setup();
    expect(select.control).toBeTruthy();
    expect(select.control?.control).toBe(host.control as any);
  });

  it('should compute invalid signal from NgControl validation', () => {
    const { select, host, fixture, selectEl } = setup();

    host.control.setValidators(Validators.required);
    host.control.setValue(null);
    host.control.markAsTouched();

    // Simulate user leaving the field — blur triggers invalidation check
    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    expect(select.invalid()).toBe(true);
  });

  it('should compute hasValue signal from NgControl value', () => {
    const { select, host, fixture } = setup();

    expect(select.hasValue()).toBe(false);

    host.control.setValue('selected-value');
    fixture.detectChanges();

    expect(select.hasValue()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests — PR 2: Dropdown lifecycle regression (approval — current behavior)
// ---------------------------------------------------------------------------

describe('Select — PR 2 (Dropdown lifecycle regression)', () => {
  it('should open on trigger click and close on second click', () => {
    const { fixture, select, trigger } = setupWithOptions();

    trigger.click();
    fixture.detectChanges();
    expect(select.isOpen()).toBe(true);

    trigger.click();
    fixture.detectChanges();
    expect(select.isOpen()).toBe(false);
  });

  it('should treat close() while closed as a no-op without firing touched', () => {
    const { host, select } = setupWithOptions();

    expect(() => select.close()).not.toThrow();

    expect(select.isOpen()).toBe(false);
    expect(host.control.touched).toBe(false);
  });

  it('should reset open state and fire touched on overlay detach', () => {
    const { fixture, host, select, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);
    expect(select.isOpen()).toBe(true);
    expect(host.control.touched).toBe(false);

    select.onOverlayDetach();

    expect(select.isOpen()).toBe(false);
    expect(host.control.touched).toBe(true);
  });

  it('should set value, notify the form, and close on selectOption', () => {
    const { fixture, host, select, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);

    select.selectOption('c');
    fixture.detectChanges();

    expect(host.control.value).toBe('c');
    expect(select.value()).toBe('c');
    expect(host.control.touched).toBe(true);
    expect(select.isOpen()).toBe(false);
  });

  it('should maintain the options registry through register/unregister', () => {
    const { select } = setupWithOptions();

    expect(select.options().length).toBe(3);

    const first = select.options()[0];
    select.unregisterOption(first);
    expect(select.options().length).toBe(2);
    expect(select.options().includes(first)).toBe(false);

    select.registerOption(first);
    expect(select.options().length).toBe(3);
    expect(select.options().includes(first)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests — PR 2: Keyboard navigation (RED)
// ---------------------------------------------------------------------------

describe('Select — PR 2 (Keyboard navigation)', () => {
  it('should open with a clean list (no active option) when there is no current value', () => {
    const { fixture, select, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);

    expect(select.activeOption()).toBeNull();
    expect(activeDescendantId(trigger)).toBeNull();
    expect(document.querySelector('.bursit-option-active')).toBeNull();
  });

  it('should activate the first enabled option on ArrowDown from a clean open', () => {
    const { fixture, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);
    pressKey(trigger, 'ArrowDown');
    fixture.detectChanges();

    expect(activeDescendantId(trigger)).toBe(renderedOptionIdByLabel('Alpha'));
  });

  it('should move to the next enabled option on ArrowDown, skipping disabled ones', () => {
    const { fixture, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);
    pressKey(trigger, 'ArrowDown');
    pressKey(trigger, 'ArrowDown');
    fixture.detectChanges();

    expect(activeDescendantId(trigger)).toBe(renderedOptionIdByLabel('Gamma'));
  });

  it('should NOT wrap past the last enabled option on ArrowDown', () => {
    const { fixture, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);
    pressKey(trigger, 'ArrowDown');
    pressKey(trigger, 'ArrowDown');
    pressKey(trigger, 'ArrowDown');
    fixture.detectChanges();

    expect(activeDescendantId(trigger)).toBe(renderedOptionIdByLabel('Gamma'));
  });

  it('should move back to the previous enabled option on ArrowUp skipping disabled ones', () => {
    const { fixture, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);
    pressKey(trigger, 'End');
    fixture.detectChanges();
    pressKey(trigger, 'ArrowUp');
    fixture.detectChanges();

    expect(activeDescendantId(trigger)).toBe(renderedOptionIdByLabel('Alpha'));
  });

  it('should activate the last enabled option on ArrowUp from a clean open', () => {
    const { fixture, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);
    pressKey(trigger, 'ArrowUp');
    fixture.detectChanges();

    expect(activeDescendantId(trigger)).toBe(renderedOptionIdByLabel('Gamma'));
  });

  it('should jump to the last enabled option on End', () => {
    const { fixture, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);
    pressKey(trigger, 'End');
    fixture.detectChanges();

    expect(activeDescendantId(trigger)).toBe(renderedOptionIdByLabel('Gamma'));
  });

  it('should jump to the first enabled option on Home, skipping leading disabled ones', () => {
    const { fixture, trigger } = setupWithOptions({
      options: [
        { value: 'a', label: 'Alpha', disabled: true },
        { value: 'b', label: 'Beta', disabled: false },
      ],
    });

    openDropdown(fixture, trigger);
    pressKey(trigger, 'Home');
    fixture.detectChanges();

    expect(activeDescendantId(trigger)).toBe(renderedOptionIdByLabel('Beta'));
  });

  it('should select the active option and close on Enter', () => {
    const { fixture, host, select, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);
    pressKey(trigger, 'ArrowDown');
    pressKey(trigger, 'Enter');
    fixture.detectChanges();

    expect(host.control.value).toBe('a');
    expect(select.isOpen()).toBe(false);
  });

  it('should select the active option and close on Space', () => {
    const { fixture, host, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);
    pressKey(trigger, 'End');
    pressKey(trigger, ' ');
    fixture.detectChanges();

    expect(host.control.value).toBe('c');
  });

  it('should close and return focus to the trigger on Escape', () => {
    const { fixture, select, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);
    pressKey(trigger, 'Escape');
    fixture.detectChanges();

    expect(select.isOpen()).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('should open clean on ArrowDown while closed, then activate the first enabled option', () => {
    const { fixture, select, trigger } = setupWithOptions();

    trigger.focus();
    pressKey(trigger, 'ArrowDown');
    fixture.detectChanges();

    expect(select.isOpen()).toBe(true);
    expect(activeDescendantId(trigger)).toBeNull();

    pressKey(trigger, 'ArrowDown');
    fixture.detectChanges();

    expect(activeDescendantId(trigger)).toBe(renderedOptionIdByLabel('Alpha'));
  });

  it('should open clean on ArrowUp while closed, then activate the last enabled option', () => {
    const { fixture, select, trigger } = setupWithOptions();

    trigger.focus();
    pressKey(trigger, 'ArrowUp');
    fixture.detectChanges();

    expect(select.isOpen()).toBe(true);
    expect(activeDescendantId(trigger)).toBeNull();

    pressKey(trigger, 'ArrowUp');
    fixture.detectChanges();

    expect(activeDescendantId(trigger)).toBe(renderedOptionIdByLabel('Gamma'));
  });

  it('should open via Enter while closed', () => {
    const { fixture, select, trigger } = setupWithOptions();

    trigger.focus();
    pressKey(trigger, 'Enter');
    fixture.detectChanges();

    expect(select.isOpen()).toBe(true);
  });

  it('should not crash with zero options when navigating and close on Enter', () => {
    const { fixture, host, select, trigger } = setupWithOptions({ options: [] });

    openDropdown(fixture, trigger);
    pressKey(trigger, 'ArrowDown');
    pressKey(trigger, 'Home');
    pressKey(trigger, 'End');
    pressKey(trigger, 'Enter');
    fixture.detectChanges();

    expect(select.isOpen()).toBe(false);
    expect(activeDescendantId(trigger)).toBeNull();
    expect(host.control.value).toBeNull();
  });

  it('should not crash with all-disabled options and close on Enter without selecting', () => {
    const { fixture, host, select, trigger } = setupWithOptions({
      options: [
        { value: 'a', label: 'Alpha', disabled: true },
        { value: 'b', label: 'Beta', disabled: true },
      ],
    });

    openDropdown(fixture, trigger);
    pressKey(trigger, 'ArrowDown');
    pressKey(trigger, 'Enter');
    fixture.detectChanges();

    expect(select.isOpen()).toBe(false);
    expect(activeDescendantId(trigger)).toBeNull();
    expect(host.control.value).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests — PR 3 polish: Tab behavior + activation on open (RED)
// ---------------------------------------------------------------------------

describe('Select — PR 3 polish (keyboard + activation)', () => {
  describe('Tab key handling', () => {
    it('should close the open panel on Tab without preventDefault so focus moves naturally', () => {
      const { fixture, select, trigger } = setupWithOptions();

      openDropdown(fixture, trigger);
      expect(select.isOpen()).toBe(true);

      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      trigger.dispatchEvent(event);
      fixture.detectChanges();

      expect(select.isOpen()).toBe(false);
      expect(event.defaultPrevented).toBe(false);
    });

    it('should not change state on Tab while closed', () => {
      const { select, trigger } = setupWithOptions();

      trigger.focus();
      pressKey(trigger, 'Tab');

      expect(select.isOpen()).toBe(false);
    });
  });

  describe('activation on open prefers current value', () => {
    it('should activate the option matching the current value when opened', () => {
      const { fixture, host, trigger } = setupWithOptions();

      host.control.setValue('c');
      fixture.detectChanges();
      openDropdown(fixture, trigger);

      expect(activeDescendantId(trigger)).toBe(renderedOptionIdByLabel('Gamma'));
    });

    it('should not activate any option when the current value maps to a disabled option', () => {
      const { fixture, host, trigger } = setupWithOptions();

      host.control.setValue('b'); // Beta is disabled
      fixture.detectChanges();
      openDropdown(fixture, trigger);

      expect(activeDescendantId(trigger)).toBeNull();
    });

    it('should not activate any option when the current value has no matching option', () => {
      const { fixture, host, trigger } = setupWithOptions();

      host.control.setValue('zzz-unknown');
      fixture.detectChanges();
      openDropdown(fixture, trigger);

      expect(activeDescendantId(trigger)).toBeNull();
    });

    it('should close without selecting on Enter when nothing is active', () => {
      const { fixture, host, select, trigger } = setupWithOptions();

      openDropdown(fixture, trigger);
      expect(select.activeOption()).toBeNull();

      pressKey(trigger, 'Enter');
      fixture.detectChanges();

      expect(select.isOpen()).toBe(false);
      expect(host.control.value).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Tests — PR 2: ARIA combobox/listbox wiring (RED)
// ---------------------------------------------------------------------------

describe('Select — PR 2 (ARIA)', () => {
  it('should expose aria-haspopup="listbox" on the trigger', () => {
    const { trigger } = setupWithOptions();

    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('should point aria-controls at the rendered listbox panel when open', () => {
    const { fixture, trigger } = setupWithOptions();

    expect(trigger.getAttribute('aria-controls')).toBeNull();

    openDropdown(fixture, trigger);

    const controlsId = trigger.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();

    const panel = document.getElementById(controlsId as string);
    expect(panel?.getAttribute('role')).toBe('listbox');
  });

  it('should mirror the active option id in aria-activedescendant', () => {
    const { fixture, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);
    pressKey(trigger, 'ArrowDown');
    pressKey(trigger, 'ArrowDown');
    fixture.detectChanges();

    const mirroredId = activeDescendantId(trigger);
    expect(mirroredId).toBe(renderedOptionIdByLabel('Gamma'));

    const target = document.getElementById(mirroredId as string);
    expect(target).toBeTruthy();
  });

  it('should give every rendered option a deterministic DOM id', () => {
    const { fixture } = setupWithOptions();

    openDropdown(fixture, document.querySelector('.bursit-select-trigger') as HTMLElement);

    const ids = Array.from(document.querySelectorAll('bursit-option')).map((el) => el.id);
    expect(ids.length).toBe(3);
    ids.forEach((id) => expect(id).toMatch(/^bursit-select-option-/));
  });
});

// ---------------------------------------------------------------------------
// Tests — PR 2 follow-up: trigger displays option label, not raw value (RED)
// ---------------------------------------------------------------------------

describe('Select — trigger label display', () => {
  function triggerValueText(trigger: HTMLElement): string {
    return (trigger.querySelector('.bursit-select-value') as HTMLElement).textContent?.trim() ?? '';
  }

  it('should display the option label after selecting an option', () => {
    const { fixture, host, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);
    pressKey(trigger, 'ArrowDown');
    pressKey(trigger, 'Enter');
    fixture.detectChanges();

    expect(host.control.value).toBe('a');
    expect(triggerValueText(trigger)).toBe('Alpha');
  });

  it('should display the option label after programmatic writeValue and an open/close cycle', () => {
    const { fixture, host, trigger } = setupWithOptions();

    host.control.setValue('c');
    fixture.detectChanges();
    openDropdown(fixture, trigger);
    pressKey(trigger, 'Escape');
    fixture.detectChanges();

    expect(triggerValueText(trigger)).toBe('Gamma');
  });

  it('should fall back to the raw value when no registered option matches', () => {
    const { fixture, host, trigger } = setupWithOptions();

    host.control.setValue('zzz-unknown');
    fixture.detectChanges();

    expect(triggerValueText(trigger)).toBe('zzz-unknown');
  });
});

// ---------------------------------------------------------------------------
// Tests — PR 2 follow-up: active option scrolls into view (RED)
// ---------------------------------------------------------------------------

describe('Select — active option scroll into view', () => {
  let scrollSpy: jest.SpyInstance;

  beforeEach(() => {
    // jsdom does not implement scrollIntoView — seed a no-op so it can be spied.
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => {};
    }
    scrollSpy = jest.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
  });

  afterEach(() => {
    scrollSpy.mockRestore();
  });

  it('should scroll the newly activated option into view on ArrowDown while open', () => {
    const { fixture, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);
    scrollSpy.mockClear();
    pressKey(trigger, 'ArrowDown');
    fixture.detectChanges();

    const alphaId = renderedOptionIdByLabel('Alpha');
    expect(alphaId).toBeTruthy();
    expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest' });
    expect(scrollSpy.mock.instances[0]?.id).toBe(alphaId);
  });

  it('should not attempt to scroll when no option is active', () => {
    const { fixture, select, trigger } = setupWithOptions({ options: [] });

    openDropdown(fixture, trigger);
    scrollSpy.mockClear();
    pressKey(trigger, 'ArrowDown');
    fixture.detectChanges();

    expect(select.activeOption()).toBeNull();
    expect(scrollSpy).not.toHaveBeenCalled();
  });
});
