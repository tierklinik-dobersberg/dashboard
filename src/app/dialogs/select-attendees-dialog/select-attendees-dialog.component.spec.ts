import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectAttendeesDialogComponent } from './select-attendees-dialog.component';

describe('SelectAttendeesDialogComponent', () => {
  let component: SelectAttendeesDialogComponent;
  let fixture: ComponentFixture<SelectAttendeesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectAttendeesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectAttendeesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
