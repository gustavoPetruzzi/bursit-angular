import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ModalComponent } from './modal.component';
import { MODAL_CONFIG, ModalConfig, ModalSize } from './modal.config';

// --- Test host for slot projection ---

@Component({
  imports: [ModalComponent],
  template: `
    <bursit-modal>
      <div bursitModalHeader>Header content</div>
      <div bursitModalBody>Body content</div>
      <div bursitModalFooter>Footer content</div>
      <div>Ghost content</div>
    </bursit-modal>
  `,
})
class TestHostComponent {}

// --- Helpers ---

function setup(overrides: Partial<ModalConfig> = {}) {
  const config = { ...overrides } as ModalConfig;

  TestBed.configureTestingModule({
    imports: [ModalComponent, TestHostComponent],
    providers: [{ provide: MODAL_CONFIG, useValue: config }],
  });

  return { fixture: TestBed.createComponent(ModalComponent), config };
}

function setupWithHost(overrides: Partial<ModalConfig> = {}) {
  const config = { ...overrides } as ModalConfig;

  TestBed.configureTestingModule({
    imports: [ModalComponent, TestHostComponent],
    providers: [{ provide: MODAL_CONFIG, useValue: config }],
  });

  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.detectChanges();

  const modalEl = fixture.nativeElement.querySelector('bursit-modal') as HTMLElement;

  return { fixture, modalEl };
}

// --- Tests ---

describe('ModalComponent', () => {
  describe('creation', () => {
    it('should create the component', () => {
      const { fixture } = setup();
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have role="dialog" on the host', () => {
      const { fixture } = setup();
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.getAttribute('role')).toBe('dialog');
    });

    it('should have aria-modal="true" on the host', () => {
      const { fixture } = setup();
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.getAttribute('aria-modal')).toBe('true');
    });

    it('should set aria-label when config.ariaLabel is provided', () => {
      const { fixture } = setup({ ariaLabel: 'Delete confirmation' });
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.getAttribute('aria-label')).toBe('Delete confirmation');
    });

    it('should set aria-labelledby when config.ariaLabelledBy is provided', () => {
      const { fixture } = setup({ ariaLabelledBy: 'modal-title-42' });
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.getAttribute('aria-labelledby')).toBe('modal-title-42');
    });

    it('should not set aria-label or aria-labelledby when config omits them', () => {
      const { fixture } = setup({ size: ModalSize.MEDIUM });
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.hasAttribute('aria-label')).toBe(false);
      expect(host.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('should warn in dev mode when no accessible name is provided', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      const { fixture } = setup({ size: ModalSize.MEDIUM });
      fixture.detectChanges();

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[bursit-modal] No accessible name provided'),
      );

      (console.warn as jest.Mock).mockRestore();
    });

    it('should NOT warn when ariaLabel is provided', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      const { fixture } = setup({ ariaLabel: 'Test' });
      fixture.detectChanges();

      expect(console.warn).not.toHaveBeenCalled();
      (console.warn as jest.Mock).mockRestore();
    });

    it('should NOT warn when ariaLabelledBy is provided', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      const { fixture } = setup({ ariaLabelledBy: 'modal-title' });
      fixture.detectChanges();

      expect(console.warn).not.toHaveBeenCalled();
      (console.warn as jest.Mock).mockRestore();
    });
  });

  describe('slot projection', () => {
    it('should project header, body, and footer into their slots', () => {
      const { modalEl } = setupWithHost();

      expect(modalEl.textContent).toContain('Header content');
      expect(modalEl.textContent).toContain('Body content');
      expect(modalEl.textContent).toContain('Footer content');
    });

    it('should not render content without a slot selector', () => {
      const { modalEl } = setupWithHost();

      const unprojected = modalEl.querySelectorAll(
        'div:not([bursitModalHeader]):not([bursitModalBody]):not([bursitModalFooter])',
      );
      expect(unprojected.length).toBe(0);
    });
  });

  describe('size classes', () => {
    it('should add bursit-size-small when config.size is SMALL', () => {
      const { fixture } = setup({ size: ModalSize.SMALL });
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.classList.contains('bursit-size-small')).toBe(true);
    });

    it('should add bursit-size-medium when config.size is MEDIUM', () => {
      const { fixture } = setup({ size: ModalSize.MEDIUM });
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.classList.contains('bursit-size-medium')).toBe(true);
    });

    it('should add bursit-size-large when config.size is LARGE', () => {
      const { fixture } = setup({ size: ModalSize.LARGE });
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.classList.contains('bursit-size-large')).toBe(true);
    });

    it('should add bursit-size-fullscreen when config.size is FULLSCREEN', () => {
      const { fixture } = setup({ size: ModalSize.FULLSCREEN });
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.classList.contains('bursit-size-fullscreen')).toBe(true);
    });
  });

  describe('default config', () => {
    it('should not add any size class when config has no size', () => {
      const { fixture } = setup({});
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;

      expect(host.classList.contains('bursit-size-small')).toBe(false);
      expect(host.classList.contains('bursit-size-medium')).toBe(false);
      expect(host.classList.contains('bursit-size-large')).toBe(false);
      expect(host.classList.contains('bursit-size-fullscreen')).toBe(false);
    });
  });
});
