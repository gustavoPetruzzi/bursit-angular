import { readFileSync } from 'fs';
import { join } from 'path';

describe('ButtonDirective Stories', () => {
  const storiesPath = join(__dirname, 'button.directive.stories.ts');
  const content = readFileSync(storiesPath, 'utf-8');

  it('should have English component description', () => {
    expect(content).toContain(
      'Attribute directive that styles a native button with the Bursit design system variants.',
    );
  });

  it('should have English story description', () => {
    expect(content).toContain('Use the controls below to try out the different button variants.');
  });

  it('should have English example button text', () => {
    expect(content).toContain('Example button');
  });

  it('should have English color arg description', () => {
    expect(content).toContain('Button color variant');
  });

  it('should have English size arg description', () => {
    expect(content).toContain('Button size (HTML attribute)');
  });

  it('should not contain Spanish strings', () => {
    expect(content).not.toContain('Variante de color del botón');
    expect(content).not.toContain('Tamaño del botón (atributo HTML)');
    expect(content).not.toContain(
      'Directiva de atributo que estiliza un botón nativo con las variantes del design system de Bursit.',
    );
    expect(content).not.toContain('Botón de ejemplo');
    expect(content).not.toContain(
      'Usá los controles de abajo para probar las diferentes variantes del botón.',
    );
  });
});
