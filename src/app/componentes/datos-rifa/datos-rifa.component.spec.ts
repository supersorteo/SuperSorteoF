import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosRifaComponent } from './datos-rifa.component';

describe('DatosRifaComponent', () => {
  let component: DatosRifaComponent;
  let fixture: ComponentFixture<DatosRifaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosRifaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatosRifaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
