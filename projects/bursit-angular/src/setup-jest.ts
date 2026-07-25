import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

// Guard against double-initialization when running via @angular-builders/jest:run
if (!(getTestBed() as any).platform) {
  setupZoneTestEnv();
}
