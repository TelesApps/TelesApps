import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoggingRecordsComponent } from './jogging-records.component';

describe('JoggingRecordsComponent', () => {
  let component: JoggingRecordsComponent;
  let fixture: ComponentFixture<JoggingRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoggingRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoggingRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
