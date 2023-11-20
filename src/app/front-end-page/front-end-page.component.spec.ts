import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrontEndPageComponent } from './front-end-page.component';

describe('FrontEndPageComponent', () => {
  let component: FrontEndPageComponent;
  let fixture: ComponentFixture<FrontEndPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrontEndPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FrontEndPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
