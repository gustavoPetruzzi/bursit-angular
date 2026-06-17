import { ModalRef } from './modal-ref';

describe('ModalRef', () => {
  describe('close', () => {
    it('should emit result through afterClosed observable', () => {
      const ref = new ModalRef<string>();
      const results: (string | undefined)[] = [];

      ref.afterClosed().subscribe((r) => results.push(r));

      ref.close('guardado');

      expect(results).toEqual(['guardado']);
    });

    it('should complete afterClosed observable after emitting', () => {
      const ref = new ModalRef<string>();
      let completed = false;

      ref.afterClosed().subscribe({
        complete: () => {
          completed = true;
        },
      });

      ref.close('ok');

      expect(completed).toBe(true);
    });

    it('should call close with no result', () => {
      const ref = new ModalRef<string>();
      const results: (string | undefined)[] = [];

      ref.afterClosed().subscribe((r) => results.push(r));
      ref.close();

      expect(results).toEqual([undefined]);
    });
  });

  describe('dismiss', () => {
    it('should emit undefined through afterClosed', () => {
      const ref = new ModalRef<string>();
      const results: (string | undefined)[] = [];

      ref.afterClosed().subscribe((r) => results.push(r));
      ref.dismiss();

      expect(results).toEqual([undefined]);
    });

    it('should complete afterClosed observable', () => {
      const ref = new ModalRef<string>();
      let completed = false;

      ref.afterClosed().subscribe({
        complete: () => {
          completed = true;
        },
      });

      ref.dismiss();

      expect(completed).toBe(true);
    });

    it('should not emit after already closed via close', () => {
      const ref = new ModalRef<string>();
      const results: (string | undefined)[] = [];

      ref.afterClosed().subscribe((r) => results.push(r));
      ref.close('done');
      ref.dismiss();

      expect(results).toEqual(['done']);
    });
  });

  describe('backdropClick', () => {
    it('should emit MouseEvent when _emitBackdropClick is called', () => {
      const ref = new ModalRef<string>();
      const events: MouseEvent[] = [];
      const fakeEvent = new MouseEvent('click');

      ref.backdropClick().subscribe((e) => events.push(e));
      ref._emitBackdropClick(fakeEvent);

      expect(events).toEqual([fakeEvent]);
    });

    it('should return an Observable', () => {
      const ref = new ModalRef<string>();
      const obs = ref.backdropClick();

      expect(obs).toBeDefined();
    });
  });

  describe('componentInstance', () => {
    it('should be undefined by default', () => {
      const ref = new ModalRef<{ title: string }>();
      expect(ref.componentInstance).toBeUndefined();
    });

    it('should be settable', () => {
      const ref = new ModalRef<{ title: string }>();
      const component = { title: 'Test modal' };

      ref.componentInstance = component;

      expect(ref.componentInstance).toBe(component);
    });
  });
});
