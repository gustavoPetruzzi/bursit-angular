import { TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { InputDirective } from './input.directive';

describe('InputDirective', () => {
  it('should create an instance', () => {
    TestBed.configureTestingModule({
      providers: [
        InputDirective,
        { provide: ElementRef, useValue: { nativeElement: document.createElement('input') } },
      ],
    });

    const directive = TestBed.inject(InputDirective);
    expect(directive).toBeTruthy();
  });
});
