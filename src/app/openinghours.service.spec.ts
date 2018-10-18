import { TestBed } from '@angular/core/testing';

import { OpeninghoursService } from './openinghours.service';

describe('OpeninghoursService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OpeninghoursService = TestBed.get(OpeninghoursService);
    expect(service).toBeTruthy();
  });
});
