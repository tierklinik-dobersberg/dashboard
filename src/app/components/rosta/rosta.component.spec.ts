import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RostaComponent } from './rosta.component';

describe('RostaComponent', () => {
  let component: RostaComponent;
  let fixture: ComponentFixture<RostaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RostaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RostaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
