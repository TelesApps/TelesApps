import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaAssistantPageComponent } from './ba-assistant-page.component';

describe('BaAssistantPageComponent', () => {
  let component: BaAssistantPageComponent;
  let fixture: ComponentFixture<BaAssistantPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaAssistantPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaAssistantPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
