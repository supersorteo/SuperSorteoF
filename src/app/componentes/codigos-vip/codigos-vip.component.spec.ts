import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodigosVipComponent } from './codigos-vip.component';

describe('CodigosVipComponent', () => {
  let component: CodigosVipComponent;
  let fixture: ComponentFixture<CodigosVipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodigosVipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CodigosVipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
