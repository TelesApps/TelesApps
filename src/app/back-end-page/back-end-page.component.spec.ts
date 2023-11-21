import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackEndPageComponent } from './back-end-page.component';

describe('BackEndPageComponent', () => {
  let component: BackEndPageComponent;
  let fixture: ComponentFixture<BackEndPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackEndPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BackEndPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
