import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RostaWidgetComponent } from './rosta-widget.component';

describe('RostaWidgetComponent', () => {
  let component: RostaWidgetComponent;
  let fixture: ComponentFixture<RostaWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RostaWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RostaWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
