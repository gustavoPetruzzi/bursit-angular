import { InjectionToken } from "@angular/core";

export const MODAL_DATA = new InjectionToken<unknown>('MODAL_DATA');

export const MODAL_CONFIG = new InjectionToken<ModalConfig>('MODAL_CONFIG');

export enum ModalSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  FULLSCREEN = 'fullscreen'
};

export interface ModalConfig<TDATA = unknown> {
  size?: ModalSize;
  data?: TDATA;
  backdropClosable?: boolean;
  escClosable?: boolean;
  hasBackdrop?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
};

export const MODAL_DEFAULTS: ModalConfig = {
  size: ModalSize.MEDIUM,
  backdropClosable: true,
  escClosable: true,
  hasBackdrop: true,
};
