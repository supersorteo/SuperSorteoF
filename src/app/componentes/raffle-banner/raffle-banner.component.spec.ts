import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaffleBannerComponent } from './raffle-banner.component';

describe('RaffleBannerComponent', () => {
  let component: RaffleBannerComponent;
  let fixture: ComponentFixture<RaffleBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaffleBannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RaffleBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
