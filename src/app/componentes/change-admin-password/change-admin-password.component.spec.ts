import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAdminPasswordComponent } from './change-admin-password.component';

describe('ChangeAdminPasswordComponent', () => {
  let component: ChangeAdminPasswordComponent;
  let fixture: ComponentFixture<ChangeAdminPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeAdminPasswordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangeAdminPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
