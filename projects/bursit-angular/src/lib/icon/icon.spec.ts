import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { BursitIconComponent } from './icon';

function createTestBed(name: string = 'search') {
  @Component({
    template: `<bursit-icon [name]="name" [size]="size" [color]="color" [strokeWidth]="strokeWidth"></bursit-icon>`,
    imports: [BursitIconComponent],
  })
  class TestHostComponent {
    name = name;
    size = 20;
    color = '#ef4444';
    strokeWidth = 3;
  }

  return TestBed.configureTestingModule({
    imports: [TestHostComponent],
  }).compileComponents().then(() => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance };
  });
}

describe('BursitIconComponent', () => {
  it('should create', async () => {
    const { host } = await createTestBed();
    expect(host).toBeTruthy();
  });

  it('should render an SVG element', async () => {
    const { fixture } = await createTestBed();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should pass size to the rendered SVG', async () => {
    const { fixture } = await createTestBed();
    const svg: SVGElement = fixture.nativeElement.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('20');
  });

  it('should pass color to the rendered SVG', async () => {
    const { fixture } = await createTestBed();
    const svg: SVGElement = fixture.nativeElement.querySelector('svg')!;
    expect(svg.getAttribute('stroke')).toBe('#ef4444');
  });

  it('should not crash with an unknown icon name', async () => {
    const { fixture } = await createTestBed('nonexistent');
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
