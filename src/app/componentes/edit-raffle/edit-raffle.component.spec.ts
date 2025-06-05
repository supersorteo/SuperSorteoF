import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRaffleComponent } from './edit-raffle.component';

describe('EditRaffleComponent', () => {
  let component: EditRaffleComponent;
  let fixture: ComponentFixture<EditRaffleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRaffleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditRaffleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
