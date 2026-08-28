import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { Select } from './select';
import { Option } from '../option/option';
import { FormField } from '../form-field/form-field';
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
      [validationInteraction]="validationInteraction()"
      [tabIndex]="tabIndex()"
    />
  `,
  imports: [ReactiveFormsModule, Select],
})
class TestHostComponent {
  control = new FormControl<string | null>(null);
  placeholder = signal('Choose an option');
  required = signal(false);
  floatingLabel = signal(false);
  validationInteraction = signal<'default' | 'touched'>('default');
  tabIndex = signal(0);
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

function setup(overrides?: {
  required?: boolean;
  floatingLabel?: boolean;
  validationInteraction?: 'default' | 'touched';
}) {
  TestBed.configureTestingModule({
    imports: [TestHostComponent],
  });

  const fixture = TestBed.createComponent(TestHostComponent);
  const host = fixture.componentInstance;

  if (overrides?.required) host.required.set(true);
  if (overrides?.floatingLabel) host.floatingLabel.set(true);
  if (overrides?.validationInteraction)
    host.validationInteraction.set(overrides.validationInteraction);

  fixture.detectChanges();

  const selectDebug = fixture.debugElement.query(By.directive(Select));
  const select: Select = selectDebug.componentInstance;

  return { fixture, host, select, selectEl: selectDebug.nativeElement as HTMLElement };
}

function setupWithOptions(overrides?: { options?: TestOptionConfig[] }) {
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

function openDropdown(
  fixture: ComponentFixture<OptionsTestHostComponent>,
  trigger: HTMLElement,
): void {
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

// ---------------------------------------------------------------------------
// Tests — PR 3: ControlValueAccessor (task 5.1)
// ---------------------------------------------------------------------------

describe('Select — ControlValueAccessor', () => {
  it('should update the component internal value on writeValue', () => {
    const { select } = setupWithOptions();

    select.writeValue('c');

    expect(select.value()).toBe('c');
  });

  it('should render the value in the trigger DOM via the form-driven path', () => {
    const { fixture, host, trigger } = setupWithOptions();

    host.control.setValue('c');
    fixture.detectChanges();

    const valueEl = trigger.querySelector('.bursit-select-value') as HTMLElement;
    expect(valueEl.textContent?.trim()).toBe('Gamma');
  });

  it('should fire registerOnChange with the option value when an option is selected', () => {
    const { fixture, select, trigger } = setupWithOptions();

    const onChange = jest.fn();
    select.registerOnChange(onChange);

    openDropdown(fixture, trigger);
    select.selectOption('c');
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('should fire registerOnTouched when the dropdown closes', () => {
    const { fixture, select, trigger } = setupWithOptions();

    const onTouched = jest.fn();
    select.registerOnTouched(onTouched);

    openDropdown(fixture, trigger);
    select.onOverlayDetach();

    expect(onTouched).toHaveBeenCalled();
  });

  it('should NOT open when disabled via setDisabledState(true)', () => {
    const { fixture, select, trigger } = setupWithOptions();

    select.setDisabledState(true);
    fixture.detectChanges();

    trigger.click();
    fixture.detectChanges();

    expect(select.disabled()).toBe(true);
    expect(select.isOpen()).toBe(false);
  });

  it('should re-enable and allow opening after setDisabledState(false)', () => {
    const { fixture, select, trigger } = setupWithOptions();

    select.setDisabledState(true);
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();
    expect(select.isOpen()).toBe(false);

    select.setDisabledState(false);
    fixture.detectChanges();

    trigger.click();
    fixture.detectChanges();

    expect(select.disabled()).toBe(false);
    expect(select.isOpen()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests — PR 3: FormField integration (task 7.1)
// ---------------------------------------------------------------------------

describe('Select — FormField integration', () => {
  function createFormFieldHost(
    control: FormControl<string | null>,
    floatingLabel = false,
    validationInteraction: 'default' | 'touched' = 'default',
  ) {
    @Component({
      template: `
        <bursit-form-field>
          <bursit-select
            [formControl]="control"
            placeholder="Choose"
            [floatingLabel]="floatingLabel"
            [validationInteraction]="validationInteraction"
          >
            <bursit-option value="a">Alpha</bursit-option>
            <bursit-option value="b">Beta</bursit-option>
          </bursit-select>
        </bursit-form-field>
      `,
      imports: [ReactiveFormsModule, FormField, Select, Option],
    })
    class WrapperComponent {
      control = control;
      floatingLabel = floatingLabel;
      validationInteraction = validationInteraction;
    }

    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();
    const selectDebug = fixture.debugElement.query(By.directive(Select));
    const select = selectDebug.componentInstance as Select;
    const selectEl = selectDebug.nativeElement as HTMLElement;
    const formFieldEl = fixture.debugElement.query(By.directive(FormField))
      .nativeElement as HTMLElement;

    return { fixture, control, select, selectEl, formFieldEl };
  }

  it('should apply the error class when the control is invalid and touched', () => {
    const control = new FormControl<string | null>(null, [Validators.required]);
    const { fixture, selectEl, formFieldEl } = createFormFieldHost(control, false, 'touched');

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new Event('focus'));
    trigger.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(control.invalid).toBe(true);
    expect(control.touched).toBe(true);
    expect(formFieldEl.classList.contains('bursit-form-field-error')).toBe(true);
  });

  it('should NOT apply the error class before the control is touched', () => {
    const control = new FormControl<string | null>(null, [Validators.required]);
    const { formFieldEl } = createFormFieldHost(control, false, 'touched');

    expect(control.invalid).toBe(true);
    expect(control.touched).toBe(false);
    expect(formFieldEl.classList.contains('bursit-form-field-error')).toBe(false);
  });

  it('should apply the floating label class when a value is set', () => {
    const control = new FormControl<string | null>(null);
    const { fixture, formFieldEl } = createFormFieldHost(control, true);

    expect(control.touched).toBe(false);
    expect(formFieldEl.classList.contains('bursit-form-field-floating-label')).toBe(true);

    control.setValue('a');
    fixture.detectChanges();
    expect(formFieldEl.classList.contains('bursit-form-field-floating-label')).toBe(true);
  });

  it('should apply the focus class when the trigger is focused', () => {
    const control = new FormControl<string | null>(null);
    const { fixture, selectEl, formFieldEl } = createFormFieldHost(control);

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    expect(selectEl.querySelector('.bursit-select-trigger')).toBe(trigger);
    expect(formFieldEl.classList.contains('bursit-focus')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests — PR 3: validationInteraction
// ---------------------------------------------------------------------------

describe('Select — validationInteraction', () => {
  it('should NOT be invalid before touch when validationInteraction=touched and the control is invalid', () => {
    const { select, host } = setup({ validationInteraction: 'touched' });
    host.control.setValidators(Validators.required);
    host.control.setValue(null);

    expect(host.control.invalid).toBe(true);
    expect(host.control.touched).toBe(false);
    expect(select.invalid()).toBe(false);
  });

  it('should become invalid after touch when validationInteraction=touched and the control is invalid', () => {
    const { fixture, select, host, selectEl } = setup({ validationInteraction: 'touched' });
    host.control.setValidators(Validators.required);
    host.control.setValue(null);

    expect(select.invalid()).toBe(false);

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new Event('focus'));
    trigger.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(host.control.touched).toBe(true);
    expect(select.invalid()).toBe(true);
  });

  it('should be invalid immediately when validationInteraction=default and the control is invalid, even untouched', () => {
    const { select, host } = setup({ validationInteraction: 'default' });
    host.control.setValidators(Validators.required);
    host.control.setValue(null);

    expect(host.control.invalid).toBe(true);
    expect(host.control.touched).toBe(false);
    expect(select.invalid()).toBe(true);
  });

  it('should stay valid after touch when validationInteraction=touched and the control is valid', () => {
    const { fixture, select, host, selectEl } = setup({ validationInteraction: 'touched' });
    host.control.setValidators(Validators.required);
    host.control.setValue('a');

    expect(host.control.valid).toBe(true);
    expect(select.invalid()).toBe(false);

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new Event('focus'));
    trigger.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(host.control.touched).toBe(true);
    expect(select.invalid()).toBe(false);
  });

  it('should re-evaluate invalid when validationInteraction changes to default without touch', () => {
    const { fixture, select, host } = setup({ validationInteraction: 'touched' });
    host.control.setValidators(Validators.required);
    host.control.setValue(null);

    expect(host.control.invalid).toBe(true);
    expect(host.control.touched).toBe(false);
    expect(select.invalid()).toBe(false);

    host.validationInteraction.set('default');
    fixture.detectChanges();

    expect(host.control.touched).toBe(false);
    expect(select.invalid()).toBe(true);
  });

  it('should safely re-evaluate when the required input is toggled', () => {
    const { fixture, select, host } = setup();
    host.control.setValidators(Validators.required);
    host.control.setValue(null);
    fixture.detectChanges();

    expect(host.control.invalid).toBe(true);
    expect(select.invalid()).toBe(true);

    host.required.set(true);
    fixture.detectChanges();
    expect(select.invalid()).toBe(true);

    host.control.setValue('a');
    fixture.detectChanges();
    expect(host.control.invalid).toBe(false);
    expect(select.invalid()).toBe(false);

    host.required.set(false);
    fixture.detectChanges();
    expect(select.invalid()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests — PR 3: tabIndex
// ---------------------------------------------------------------------------

describe('Select — tabIndex', () => {
  it('should default the trigger tabindex to 0', () => {
    const { selectEl } = setup();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    expect(trigger.getAttribute('tabindex')).toBe('0');
  });

  it('should reflect a custom tabIndex input on the trigger', () => {
    const { fixture, host, selectEl } = setup();
    host.tabIndex.set(3);
    fixture.detectChanges();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    expect(trigger.getAttribute('tabindex')).toBe('3');
  });

  it('should force tabindex to -1 when disabled even with a custom tabIndex', () => {
    const { fixture, host, selectEl } = setup();
    host.tabIndex.set(3);
    host.control.disable();
    fixture.detectChanges();

    const trigger = selectEl.querySelector('.bursit-select-trigger') as HTMLElement;
    expect(trigger.getAttribute('tabindex')).toBe('-1');
  });
});

// ---------------------------------------------------------------------------
// Tests — PR 3: Edge cases (task 8.1)
// ---------------------------------------------------------------------------

describe('Select — Edge cases', () => {
  it('should select and close normally with a single option', () => {
    const { fixture, host, select, trigger } = setupWithOptions({
      options: [{ value: 'only', label: 'Solo', disabled: false }],
    });

    openDropdown(fixture, trigger);
    expect(select.options().length).toBe(1);

    pressKey(trigger, 'ArrowDown');
    pressKey(trigger, 'Enter');
    fixture.detectChanges();

    expect(host.control.value).toBe('only');
    expect(select.isOpen()).toBe(false);
  });

  it('should bind long selected text into the trigger value element', () => {
    const longLabel = 'x'.repeat(200);
    const { fixture, host, trigger } = setupWithOptions({
      options: [{ value: 'long', label: longLabel, disabled: false }],
    });

    host.control.setValue('long');
    fixture.detectChanges();

    const valueEl = trigger.querySelector('.bursit-select-value') as HTMLElement;
    expect(valueEl).toBeTruthy();
    expect(valueEl.textContent).toBe(longLabel);
  });

  it('should remain consistent across rapid open/close toggling', () => {
    const { fixture, select, trigger } = setupWithOptions();

    trigger.click();
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();

    expect(select.isOpen()).toBe(true);
    expect(select.activeOption()).toBeNull();

    trigger.click();
    fixture.detectChanges();
    expect(select.isOpen()).toBe(false);
  });

  it('should not throw when destroyed while the dropdown is open', () => {
    const { fixture, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);
    expect(selectIsOpen(fixture)).toBe(true);

    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should update the value without crashing when writeValue is called while open', () => {
    const { fixture, select, trigger } = setupWithOptions();

    openDropdown(fixture, trigger);

    select.writeValue('c');

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(select.value()).toBe('c');
    expect(select.isOpen()).toBe(true);
  });

  it('should render the empty-state message when the dropdown is open with no options', () => {
    const { fixture, select, trigger } = setupWithOptions({ options: [] });

    expect(select.hasOptions()).toBe(false);
    expect(select.isOpen()).toBe(false);

    openDropdown(fixture, trigger);

    const emptyEl = document.querySelector('.bursit-select-empty') as HTMLElement | null;
    expect(emptyEl).toBeTruthy();
    expect(emptyEl?.textContent?.trim()).toBe('No options available');
  });

  it('should NOT render the empty-state when the dropdown is closed', () => {
    const { fixture } = setupWithOptions({ options: [] });

    const emptyEl = document.querySelector('.bursit-select-empty') as HTMLElement | null;
    expect(emptyEl).toBeNull();
  });
});

function selectIsOpen(fixture: ComponentFixture<OptionsTestHostComponent>): boolean {
  const selectDebug = fixture.debugElement.query(By.directive(Select));
  return (selectDebug.componentInstance as Select).isOpen();
}
