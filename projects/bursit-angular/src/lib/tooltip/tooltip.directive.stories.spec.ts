import { readFileSync } from 'fs';
import { join } from 'path';

describe('TooltipDirective Stories', () => {
  const storiesPath = join(__dirname, 'tooltip.directive.stories.ts');
  const content = readFileSync(storiesPath, 'utf-8');

  it('should have English component description', () => {
    expect(content).toContain(
      'Attribute directive `[bursitTooltip]` that shows contextual help near its host via a CDK overlay.',
    );
  });

  it('should have English story description', () => {
    expect(content).toContain('Hover/focus to show, leave/blur or Escape to hide,');
  });

  it('should have English default story text', () => {
    expect(content).toContain('Save changes');
  });

  it('should have English position arg description', () => {
    expect(content).toContain('Preferred edge where the tooltip opens.');
  });

  it('should not contain Spanish strings', () => {
    expect(content).not.toContain('guardar cambios');
    expect(content).not.toContain('posicion');
    expect(content).not.toContain('activa el tooltip');
  });
});
