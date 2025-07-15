import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FpagosComponent } from './fpagos.component';

describe('FpagosComponent', () => {
  let component: FpagosComponent;
  let fixture: ComponentFixture<FpagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FpagosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FpagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
