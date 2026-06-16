import { InjectionToken } from '@angular/core';

import { MODAL_DATA, ModalConfig, ModalSize } from './modal.config';

describe('ModalConfig', () => {
  describe('MODAL_DATA', () => {
    it('should be an InjectionToken', () => {
      expect(MODAL_DATA).toBeInstanceOf(InjectionToken);
    });
  });

  describe('ModalSizes', () => {
    it('should include all four size variants', () => {
      expect(ModalSize.SMALL).toBe('small');
      expect(ModalSize.MEDIUM).toBe('medium');
      expect(ModalSize.LARGE).toBe('large');
      expect(ModalSize.FULLSCREEN).toBe('fullscreen');
    });
  });

  describe('ModalConfig', () => {
    it('should accept empty config with no required fields', () => {
      const config: ModalConfig = {};
      expect(config).toBeDefined();
    });

    it('should accept full configuration with all fields', () => {
      const config: ModalConfig<{ userId: number }> = {
        size: ModalSize.LARGE,
        data: { userId: 42 },
        backdropClosable: false,
        escClosable: false,
        hasBackdrop: true,
        ariaLabel: 'User profile',
        ariaLabelledBy: 'modal-title',
      };

      expect(config.size).toBe(ModalSize.LARGE);
      expect(config.data).toEqual({ userId: 42 });
      expect(config.backdropClosable).toBe(false);
      expect(config.escClosable).toBe(false);
      expect(config.hasBackdrop).toBe(true);
      expect(config.ariaLabel).toBe('User profile');
      expect(config.ariaLabelledBy).toBe('modal-title');
    });

    it('should infer TData type from the data field', () => {
      const config: ModalConfig = { data: 'a string' };
      expect(config.data).toBe('a string');
    });
  });
});
