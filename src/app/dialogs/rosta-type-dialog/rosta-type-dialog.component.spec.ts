import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RostaTypeDialogComponent } from './rosta-type-dialog.component';

describe('EnterNameDialogComponent', () => {
  let component: RostaTypeDialogComponent;
  let fixture: ComponentFixture<RostaTypeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RostaTypeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RostaTypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
