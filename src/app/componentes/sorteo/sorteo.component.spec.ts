import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SorteoComponent } from './sorteo.component';

describe('SorteoComponent', () => {
  let component: SorteoComponent;
  let fixture: ComponentFixture<SorteoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SorteoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SorteoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
