import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeFrameDialogComponent } from './time-frame-dialog.component';

describe('TimeFrameDialogComponent', () => {
  let component: TimeFrameDialogComponent;
  let fixture: ComponentFixture<TimeFrameDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeFrameDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeFrameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
