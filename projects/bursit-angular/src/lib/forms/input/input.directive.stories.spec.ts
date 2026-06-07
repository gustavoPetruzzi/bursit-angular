import { readFileSync } from 'fs';
import { join } from 'path';

describe('InputDirective Stories', () => {
  const storiesPath = join(__dirname, 'input.directive.stories.ts');
  const content = readFileSync(storiesPath, 'utf-8');

  it('should have English component description', () => {
    expect(content).toContain(
      'Attribute directive that enhances a native input element with Bursit form-field integration.',
    );
  });

  it('should have English story description', () => {
    expect(content).toContain('Use the controls below to try out the different input states.');
  });

  it('should have English label arg description', () => {
    expect(content).toContain('Label text shown inside bursit-form-field');
  });

  it('should have English placeholder arg description', () => {
    expect(content).toContain('Placeholder text for the input');
  });

  it('should not contain Spanish strings', () => {
    expect(content).not.toContain('Etiqueta');
    expect(content).not.toContain('Directiva de atributo que');
    expect(content).not.toContain('Usá los controles');
    expect(content).not.toContain('Posición de la etiqueta');
    expect(content).not.toContain('Campo de texto de ejemplo');
  });
});
