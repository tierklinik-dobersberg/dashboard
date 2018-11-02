import { TestBed } from '@angular/core/testing';

import { HypnoloadService } from './hypnoload.service';

describe('HypnoloadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HypnoloadService = TestBed.get(HypnoloadService);
    expect(service).toBeTruthy();
  });
});
