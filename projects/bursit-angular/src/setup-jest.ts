import { getTestBed } from '@angular/core/testing';
import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

// Guard against double-initialization when running via @angular-builders/jest:run
if (!(getTestBed() as any).platform) {
  setupZonelessTestEnv();
}