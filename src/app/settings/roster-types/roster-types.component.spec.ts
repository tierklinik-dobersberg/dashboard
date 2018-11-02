import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RosterTypesComponent } from './roster-types.component';

describe('RostaTypesComponent', () => {
  let component: RosterTypesComponent;
  let fixture: ComponentFixture<RosterTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RosterTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RosterTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
