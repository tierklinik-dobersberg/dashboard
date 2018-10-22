import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRostaScheduleComponent } from './create-rosta-schedule.component';

describe('CreateRostaScheduleComponent', () => {
  let component: CreateRostaScheduleComponent;
  let fixture: ComponentFixture<CreateRostaScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateRostaScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRostaScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
