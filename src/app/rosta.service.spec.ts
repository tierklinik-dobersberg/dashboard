import { TestBed } from '@angular/core/testing';

import { RostaService } from './rosta.service';

describe('RostaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RostaService = TestBed.get(RostaService);
    expect(service).toBeTruthy();
  });
});
