import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RostaTypesComponent } from './rosta-types.component';

describe('RostaTypesComponent', () => {
  let component: RostaTypesComponent;
  let fixture: ComponentFixture<RostaTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RostaTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RostaTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
