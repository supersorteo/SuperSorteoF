import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalRaffleComponent } from './external-raffle.component';

describe('ExternalRaffleComponent', () => {
  let component: ExternalRaffleComponent;
  let fixture: ComponentFixture<ExternalRaffleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalRaffleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExternalRaffleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
