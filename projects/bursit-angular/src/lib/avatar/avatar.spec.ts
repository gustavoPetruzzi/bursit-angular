import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Avatar } from './avatar';

describe('Avatar', () => {
  let component: Avatar;
  let fixture: ComponentFixture<Avatar>;

  function setup(inputs?: {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    userName?: string;
    src?: string | null;
  }): { fixture: ComponentFixture<Avatar>; component: Avatar } {
    const fixture = TestBed.createComponent(Avatar);
    const component = fixture.componentInstance;
    if (inputs?.size) {
      fixture.componentRef.setInput('size', inputs.size);
    }

    if (inputs?.userName !== undefined) {
      fixture.componentRef.setInput('userName', inputs.userName);
    }

    if (inputs?.src !== undefined) {
      fixture.componentRef.setInput('src', inputs?.src);
    }

    fixture.detectChanges();
    return { fixture, component };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Avatar],
    }).compileComponents();

    fixture = TestBed.createComponent(Avatar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  // Test for default values

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create default size class bursit-sm', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.classList).toContain('bursit-sm');
  });

  it('should render default initials NN when no username is provided', () => {
    const { fixture } = setup();
    const spanElement = fixture.nativeElement.querySelector('span');
    expect(spanElement?.textContent?.trim()).toBe('NN');
  });

  it('should render <span> and not <img> when src is null', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.querySelector('span')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
  });

  it('should apply bursit-xs', () => {
    const setupOptions = { size: 'xs' } as const;
    const { fixture } = setup(setupOptions);
    expect(fixture.nativeElement.classList).toContain('bursit-xs');
  });

  it('should apply bursit-sm', () => {
    const setupOptions = { size: 'sm' } as const;
    const { fixture } = setup(setupOptions);
    expect(fixture.nativeElement.classList).toContain('bursit-sm');
  });

  it('should apply bursit-md', () => {
    const setupOptions = { size: 'md' } as const;
    const { fixture } = setup(setupOptions);
    expect(fixture.nativeElement.classList).toContain('bursit-md');
  });

  it('should apply bursit-lg', () => {
    const setupOptions = { size: 'lg' } as const;
    const { fixture } = setup(setupOptions);
    expect(fixture.nativeElement.classList).toContain('bursit-lg');
  });

  it('should apply bursit-xl', () => {
    const setupOptions = { size: 'xl' } as const;
    const { fixture } = setup(setupOptions);
    expect(fixture.nativeElement.classList).toContain('bursit-xl');
  });

  it('should apply bursit-2xl', () => {
    const setupOptions = { size: '2xl' } as const;
    const { fixture } = setup(setupOptions);
    expect(fixture.nativeElement.classList).toContain('bursit-2xl');
  });

  it('should not apply other sizes classes', () => {
    const setupOptions = { size: 'xl' } as const;
    const { fixture } = setup(setupOptions);
    expect(fixture.nativeElement.classList).toContain('bursit-xl');
    expect(fixture.nativeElement.classList).not.toContain('bursit-xs');
    expect(fixture.nativeElement.classList).not.toContain('bursit-sm');
    expect(fixture.nativeElement.classList).not.toContain('bursit-md');
    expect(fixture.nativeElement.classList).not.toContain('bursit-lg');
    expect(fixture.nativeElement.classList).not.toContain('bursit-2xl');
  });

  it('should return single initial for one-word name', () => {
    const userName = 'Yusti';
    const setupOptions = { userName } as const;
    const { fixture } = setup(setupOptions);
    const spanElement: Element = fixture.nativeElement.querySelector('span');
    expect(spanElement.textContent?.trim()).toBe(userName[0].toUpperCase());
  });

  it('should return first + last initial for two-word name', () => {
    const firstName = 'Yusti';
    const lastName = 'Guzman';
    const setupOptions = { userName: `${firstName} ${lastName}` } as const;
    const { fixture } = setup(setupOptions);
    const spanElement: Element = fixture.nativeElement.querySelector('span');
    expect(spanElement.textContent?.trim()).toBe(
      `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`,
    );
  });

  it('should return first + last initial for name with three words', () => {
    const setupOptions = { userName: 'Juan David Pérez' };
    const { fixture } = setup(setupOptions);
    const spanElement: Element = fixture.nativeElement.querySelector('span');
    expect(spanElement.textContent?.trim()).toBe('JP');
  });

  it('should return first + last initial for four-word name', () => {
    const setupOptions = { userName: 'María José García López' };
    const { fixture } = setup(setupOptions);
    const spanElement: Element = fixture.nativeElement.querySelector('span');
    expect(spanElement.textContent?.trim()).toBe('ML');
  });

  it('should trim leading/trailing spaces', () => {
    const setupOptions = { userName: '  Juan  ' } as const;
    const { fixture } = setup(setupOptions);
    const spanElement: Element = fixture.nativeElement.querySelector('span');
    expect(spanElement.textContent?.trim()).toBe('J');
  });

  it('should return empty string for empty input', () => {
    const setupOptions = { userName: '' } as const;
    const { fixture } = setup(setupOptions);
    const spanElement: Element = fixture.nativeElement.querySelector('span');
    expect(spanElement.textContent?.trim()).toBe('');
  });

  it('should handle multiple spaces between words', () => {
    const setupOptions = { userName: 'Juan   Pérez' } as const;
    const { fixture } = setup(setupOptions);
    const spanElement: Element = fixture.nativeElement.querySelector('span');
    expect(spanElement.textContent?.trim()).toBe('JP');
  });

  it('should uppercase lowercase input', () => {
    const setupOptions = { userName: 'ana' } as const;
    const { fixture } = setup(setupOptions);
    const spanElement: Element = fixture.nativeElement.querySelector('span');
    expect(spanElement.textContent?.trim()).toBe('A');
  });

  it('should handle unicode characters', () => {
    const setupOptions = { userName: 'ñandú' } as const;
    const { fixture } = setup(setupOptions);
    const spanElement: Element = fixture.nativeElement.querySelector('span');
    expect(spanElement.textContent?.trim()).toBe('Ñ');
  });

  // 5. Renderizado condicional (img vs span)

  it('should render <img> when src is provided', () => {
    const { fixture } = setup({ src: '/avatar.png' });
    expect(fixture.nativeElement.querySelector('img')).toBeTruthy();
  });

  it('should not render <span> when src is provided', () => {
    const { fixture } = setup({ src: '/avatar.png' });
    expect(fixture.nativeElement.querySelector('span')).toBeNull();
  });

  it('<img> should have correct alt attribute', () => {
    const { fixture } = setup({ src: '/avatar.png', userName: 'Juan' });
    const img = fixture.nativeElement.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('Juan');
  });

  it('<img> should have correct title attribute', () => {
    const { fixture } = setup({ src: '/avatar.png', userName: 'Juan' });
    const img = fixture.nativeElement.querySelector('img');
    expect(img?.getAttribute('title')).toBe('Juan');
  });

  it('<img> should have correct src attribute', () => {
    const { fixture } = setup({ src: '/avatar.png', userName: 'Juan' });
    const img = fixture.nativeElement.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/avatar.png');
  });

  it('should revert to <span> when src becomes null', () => {
    const { fixture } = setup({ src: '/avatar.png' });
    expect(fixture.nativeElement.querySelector('img')).toBeTruthy();

    fixture.componentRef.setInput('src', null);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('span')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
  });

  it('<span> should have role="img"', () => {
    const { fixture } = setup();
    const span = fixture.nativeElement.querySelector('span');
    expect(span?.getAttribute('role')).toBe('img');
  });

  it('<span> should have title with userName', () => {
    const { fixture } = setup({ userName: 'María' });
    const span = fixture.nativeElement.querySelector('span');
    expect(span?.getAttribute('title')).toBe('María');
  });

  it('<span> should display computed initials', () => {
    const { fixture } = setup({ userName: 'Ana López' });
    const span = fixture.nativeElement.querySelector('span');
    expect(span?.textContent?.trim()).toBe('AL');
  });

  // 6. Reactividad de signals

  it('should update host class when size changes', () => {
    const { fixture } = setup({ size: 'xs' });
    expect(fixture.nativeElement.classList).toContain('bursit-xs');

    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('bursit-lg');
    expect(fixture.nativeElement.classList).not.toContain('bursit-xs');
  });

  it('should update initials in DOM when userName changes', () => {
    const { fixture } = setup({ userName: 'Juan' });
    let span = fixture.nativeElement.querySelector('span');
    expect(span?.textContent?.trim()).toBe('J');

    fixture.componentRef.setInput('userName', 'Pedro');
    fixture.detectChanges();

    span = fixture.nativeElement.querySelector('span');
    expect(span?.textContent?.trim()).toBe('P');
  });

  it('should toggle template when src is set then cleared', () => {
    const { fixture } = setup();

    fixture.componentRef.setInput('src', '/img.png');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('span')).toBeNull();

    fixture.componentRef.setInput('src', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('span')).toBeTruthy();
  });
});
