import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwimRecordsComponent } from './swim-records.component';

describe('SwimRecordsComponent', () => {
  let component: SwimRecordsComponent;
  let fixture: ComponentFixture<SwimRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwimRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwimRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
