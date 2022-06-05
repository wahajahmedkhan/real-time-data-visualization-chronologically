import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTravelSelectorComponent } from './time-travel-selector.component';

describe('TimeTravelSelectorComponent', () => {
  let component: TimeTravelSelectorComponent;
  let fixture: ComponentFixture<TimeTravelSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeTravelSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeTravelSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
