import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaFormatterComponent } from './ba-formatter.component';

describe('BaFormatterComponent', () => {
  let component: BaFormatterComponent;
  let fixture: ComponentFixture<BaFormatterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaFormatterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaFormatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
