// change-admin-password.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PasswordModule } from 'primeng/password';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-change-admin-password',
  standalone: true,
  imports: [CommonModule, RouterModule, PasswordModule, FormsModule, ButtonModule],
  templateUrl: './change-admin-password.component.html',
  styleUrl: './change-admin-password.component.scss'
})
export class ChangeAdminPasswordComponent {
  adminUser: string | null = localStorage.getItem('adminUser');
  newPassword!: string;

  constructor(private authService: AuthService, private router: Router) {}

  cambiarPassword0() {
    if (!this.adminUser) {
      Swal.fire('Error', 'No tienes permisos para cambiar la contraseña.', 'error');
      return;
    }

    if (!this.newPassword || this.newPassword.length < 6) {
      Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }

    this.authService.cambiarPassword(this.adminUser, this.newPassword).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Contraseña actualizada correctamente.', 'success');
        this.newPassword = '';
      },
      error: (err) => {
  console.error('Error al cambiar contraseña:', err);
  Swal.fire('Error', err?.error || 'No autorizado o error en el servidor.', 'error');
}
    });
  }


  cambiarPassword() {
  if (!this.adminUser) {
    Swal.fire('Error', 'No tienes permisos para cambiar la contraseña.', 'error');
    return;
  }

  if (!this.newPassword || this.newPassword.length < 6) {
    Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres.', 'error');
    return;
  }

  this.authService.cambiarPassword(this.adminUser, this.newPassword).subscribe({
    next: (res) => {
      if (res.success) {
        Swal.fire('Éxito', res.message, 'success');
        this.newPassword = '';
      } else {
        Swal.fire('Error', res.message, 'error');
      }
    },
    error: (err) => {
      console.error('Error al cambiar contraseña:', err);
      Swal.fire('Error', 'No se pudo cambiar la contraseña.', 'error');
    }
  });
}

volver(){
  this.router.navigate(['/home'])
}


}
