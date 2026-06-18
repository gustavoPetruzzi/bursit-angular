import { InjectionToken } from "@angular/core";
export const FORM_FIELD_ID = new InjectionToken<string>('FORM_FIELD_ID');

let nextId = 0;

export function createFieldId(): string {
  return `bursit-field-${nextId++}`;
}