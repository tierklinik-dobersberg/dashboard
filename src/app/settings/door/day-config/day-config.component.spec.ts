import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayConfigComponent } from './day-config.component';

describe('DayConfigComponent', () => {
  let component: DayConfigComponent;
  let fixture: ComponentFixture<DayConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
