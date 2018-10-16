import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTimeOffsetComponent } from './select-time-offset.component';

describe('SelectTimeOffsetComponent', () => {
  let component: SelectTimeOffsetComponent;
  let fixture: ComponentFixture<SelectTimeOffsetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectTimeOffsetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectTimeOffsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
