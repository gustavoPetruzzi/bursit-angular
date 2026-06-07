import { BursitThemeService, ThemeMode } from './theme.service';

describe('BursitThemeService', () => {
  let service: BursitThemeService;
  let localStorageMock: Storage;
  let setAttributeSpy: jest.SpyInstance;
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    matchMediaMock = jest.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    setAttributeSpy = jest.spyOn(document.documentElement, 'setAttribute');
  });

  afterEach(() => {
    setAttributeSpy.mockRestore();
    jest.clearAllMocks();
  });

  function createMatchMediaResult(matches: boolean) {
    return {
      matches,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  }

  function setupService(platformId: Object = 'browser') {
    service = new BursitThemeService(platformId);
  }

  describe('initialization', () => {
    it('should read saved theme from localStorage when available', () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue('dark');
      matchMediaMock.mockReturnValue(createMatchMediaResult(false));

      setupService();

      expect(service.mode()).toBe('dark');
      expect(service.effectiveTheme()).toBe('dark');
      expect(setAttributeSpy).toHaveBeenCalledWith('bursit-theme', 'dark');
    });

    it('should default to system when no saved theme exists', () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue(null);
      matchMediaMock.mockReturnValue(createMatchMediaResult(true));

      setupService();

      expect(service.mode()).toBe('system');
      expect(service.effectiveTheme()).toBe('dark');
      expect(setAttributeSpy).toHaveBeenCalledWith('bursit-theme', 'dark');
    });

    it('should default to light system theme when prefers-color-scheme is light', () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue(null);
      matchMediaMock.mockReturnValue(createMatchMediaResult(false));

      setupService();

      expect(service.mode()).toBe('system');
      expect(service.effectiveTheme()).toBe('light');
      expect(setAttributeSpy).toHaveBeenCalledWith('bursit-theme', 'light');
    });

    it('should not access localStorage or DOM on server', () => {
      setupService('server');

      expect(service.mode()).toBe('light');
      expect(service.effectiveTheme()).toBe('light');
      expect(localStorageMock.getItem).not.toHaveBeenCalled();
      expect(setAttributeSpy).not.toHaveBeenCalled();
    });
  });

  describe('setTheme', () => {
    beforeEach(() => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue('light');
      matchMediaMock.mockReturnValue(createMatchMediaResult(false));
      setupService();
      setAttributeSpy.mockClear();
      (localStorageMock.setItem as jest.Mock).mockClear();
    });

    it('should set light theme', () => {
      service.setTheme('light');

      expect(service.mode()).toBe('light');
      expect(service.effectiveTheme()).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('bursit-theme', 'light');
      expect(setAttributeSpy).toHaveBeenCalledWith('bursit-theme', 'light');
    });

    it('should set dark theme', () => {
      service.setTheme('dark');

      expect(service.mode()).toBe('dark');
      expect(service.effectiveTheme()).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('bursit-theme', 'dark');
      expect(setAttributeSpy).toHaveBeenCalledWith('bursit-theme', 'dark');
    });

    it('should set system theme and derive effective from matchMedia', () => {
      matchMediaMock.mockReturnValue(createMatchMediaResult(true));

      service.setTheme('system');

      expect(service.mode()).toBe('system');
      expect(service.effectiveTheme()).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('bursit-theme', 'system');
      expect(setAttributeSpy).toHaveBeenCalledWith('bursit-theme', 'dark');
    });

    it('should not access localStorage or DOM on server', () => {
      service = new BursitThemeService('server');
      setAttributeSpy.mockClear();
      (localStorageMock.setItem as jest.Mock).mockClear();

      service.setTheme('dark');

      expect(service.mode()).toBe('dark');
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(setAttributeSpy).not.toHaveBeenCalled();
    });
  });

  describe('toggle', () => {
    beforeEach(() => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue('light');
      matchMediaMock.mockReturnValue(createMatchMediaResult(false));
      setupService();
      setAttributeSpy.mockClear();
      (localStorageMock.setItem as jest.Mock).mockClear();
    });

    it('should cycle light -> dark -> system -> light', () => {
      expect(service.mode()).toBe('light');

      service.toggle();
      expect(service.mode()).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('bursit-theme', 'dark');

      service.toggle();
      expect(service.mode()).toBe('system');
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith('bursit-theme', 'system');

      service.toggle();
      expect(service.mode()).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith('bursit-theme', 'light');
    });
  });

  describe('media query listener', () => {
    it('should update effective theme when system preference changes', () => {
      const addEventListener = jest.fn();
      const removeEventListener = jest.fn();
      let changeCallback: (() => void) | null = null;

      addEventListener.mockImplementation((_event: string, cb: () => void) => {
        changeCallback = cb;
      });

      let isDark = false;
      matchMediaMock.mockImplementation(() => ({
        get matches() {
          return isDark;
        },
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addEventListener,
        removeEventListener,
        dispatchEvent: jest.fn(),
      }));

      (localStorageMock.getItem as jest.Mock).mockReturnValue('system');
      setupService();
      setAttributeSpy.mockClear();

      expect(service.effectiveTheme()).toBe('light');
      expect(addEventListener).toHaveBeenCalled();

      isDark = true;
      changeCallback?.();

      expect(service.effectiveTheme()).toBe('dark');
      expect(setAttributeSpy).toHaveBeenCalledWith('bursit-theme', 'dark');
    });

    it('should remove listener when switching away from system', () => {
      const removeEventListener = jest.fn();
      matchMediaMock.mockImplementation(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener,
        dispatchEvent: jest.fn(),
      }));

      (localStorageMock.getItem as jest.Mock).mockReturnValue('system');
      setupService();

      service.setTheme('light');

      expect(removeEventListener).toHaveBeenCalled();
    });
  });
});
