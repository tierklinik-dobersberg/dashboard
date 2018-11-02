import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HypnoloadComponent } from './hypnoload.component';

describe('HypnoloadComponent', () => {
  let component: HypnoloadComponent;
  let fixture: ComponentFixture<HypnoloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HypnoloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HypnoloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
