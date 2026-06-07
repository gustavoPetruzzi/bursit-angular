import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class BursitThemeService {
  readonly mode = signal<ThemeMode>('light');
  readonly effectiveTheme = signal<EffectiveTheme>('light');

  private mediaQuery: MediaQueryList | null = null;
  private mediaListener: (() => void) | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.init();
    }
  }

  toggle(): void {
    const current = this.mode();
    const next: ThemeMode = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
    this.setTheme(next);
  }

  setTheme(theme: ThemeMode): void {
    this.mode.set(theme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('bursit-theme', theme);
      this.applyEffectiveTheme();
    }
  }

  private init(): void {
    const saved = localStorage.getItem('bursit-theme') as ThemeMode | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      this.mode.set(saved);
    } else {
      this.mode.set('system');
    }
    this.applyEffectiveTheme();
  }

  private applyEffectiveTheme(): void {
    const currentMode = this.mode();
    let effective: EffectiveTheme;

    if (currentMode === 'system') {
      effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      this.setupMediaListener();
    } else {
      effective = currentMode;
      this.teardownMediaListener();
    }

    this.effectiveTheme.set(effective);
    document.documentElement.setAttribute('bursit-theme', effective);
  }

  private setupMediaListener(): void {
    if (this.mediaQuery) {
      return;
    }
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaListener = () => this.applyEffectiveTheme();
    this.mediaQuery.addEventListener('change', this.mediaListener);
  }

  private teardownMediaListener(): void {
    if (this.mediaQuery && this.mediaListener) {
      this.mediaQuery.removeEventListener('change', this.mediaListener);
      this.mediaQuery = null;
      this.mediaListener = null;
    }
  }
}
