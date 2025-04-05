import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwimTrackerComponent } from './swim-tracker.component';

describe('SwimTrackerComponent', () => {
  let component: SwimTrackerComponent;
  let fixture: ComponentFixture<SwimTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwimTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwimTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
