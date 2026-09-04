import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipPanel } from './tooltip-panel';
import { TooltipPosition } from '../tooltip-position.type';

describe('TooltipPanel', () => {
  it('should render string content', () => {
    const fixture = createStringFixture('Hello tooltip');
    expect(panelEl(fixture).textContent?.trim()).toBe('Hello tooltip');
    fixture.destroy();
  });

  it('should render TemplateRef content', () => {
    const fixture = createTemplateRefFixture('Rich content');
    expect(panelEl(fixture).textContent?.trim()).toBe('Rich content');
    fixture.destroy();
  });

  it('should expose role="tooltip"', () => {
    const fixture = createStringFixture('Hello');
    expect(panelEl(fixture).getAttribute('role')).toBe('tooltip');
    fixture.destroy();
  });

  it('should bind the panel id from the panelId input', () => {
    const fixture = createStringFixture('Hello', { panelId: 'my-panel' });
    expect(panelEl(fixture).id).toBe('my-panel');
    fixture.destroy();
  });

  it('should apply the default top position class', () => {
    const fixture = createStringFixture('Hello');
    const el = panelEl(fixture);
    expect(el.classList.contains('bursit-tooltip')).toBe(true);
    expect(el.classList.contains('bursit-tooltip-top')).toBe(true);
    fixture.destroy();
  });

  it('should apply the position class from input', () => {
    const fixture = createStringFixture('Hello', { position: 'bottom' });
    const el = panelEl(fixture);
    expect(el.classList.contains('bursit-tooltip-bottom')).toBe(true);
    expect(el.classList.contains('bursit-tooltip-top')).toBe(false);
    fixture.destroy();
  });

  it('should apply the no-arrow class when arrow is false', () => {
    const fixture = createStringFixture('Hello', { arrow: false });
    const el = panelEl(fixture);
    expect(el.classList.contains('bursit-tooltip-no-arrow')).toBe(true);
    fixture.destroy();
  });

  it('should not apply the no-arrow class when arrow is true', () => {
    const fixture = createStringFixture('Hello', { arrow: true });
    const el = panelEl(fixture);
    expect(el.classList.contains('bursit-tooltip-no-arrow')).toBe(false);
    fixture.destroy();
  });
});

type PanelOptions = {
  position?: TooltipPosition;
  arrow?: boolean;
  panelId?: string;
  content?: string | TemplateRef<unknown>;
};

@Component({
  template: `
    <bursit-tooltip-panel
      [content]="opts.content"
      [position]="opts.position"
      [arrow]="opts.arrow"
      [panelId]="opts.panelId"
    />
  `,
  imports: [TooltipPanel],
})
class StringTestComponent {
  opts: PanelOptions = { content: '', position: 'top', arrow: true, panelId: '' };
}

@Component({
  template: `
    <bursit-tooltip-panel [content]="template" />
    <ng-template #template>
      <strong>{{ value }}</strong>
    </ng-template>
  `,
  imports: [TooltipPanel],
})
class TemplateRefTestComponent {
  value = 'Rich content';
  @ViewChild('template', { read: TemplateRef }) template!: TemplateRef<unknown>;
}

function createStringFixture(
  content: string,
  options: PanelOptions = {},
): ComponentFixture<StringTestComponent> {
  TestBed.configureTestingModule({ imports: [StringTestComponent] });
  const fixture = TestBed.createComponent(StringTestComponent);
  fixture.componentInstance.opts = {
    content,
    position: options.position ?? 'top',
    arrow: options.arrow ?? true,
    panelId: options.panelId ?? '',
  };
  fixture.detectChanges();
  return fixture;
}

function createTemplateRefFixture(
  value: string,
): ComponentFixture<TemplateRefTestComponent> {
  TestBed.configureTestingModule({ imports: [TemplateRefTestComponent] });
  const fixture = TestBed.createComponent(TemplateRefTestComponent);
  fixture.componentInstance.value = value;
  fixture.detectChanges();
  return fixture;
}

function panelEl(fixture: ComponentFixture<unknown>): HTMLElement {
  return (fixture.nativeElement as HTMLElement).querySelector(
    'bursit-tooltip-panel',
  ) as HTMLElement;
}
