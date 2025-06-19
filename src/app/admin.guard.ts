import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from './services/auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  async canActivate(): Promise<boolean> {

    const adminUser = localStorage.getItem('adminUser');

    // ✅ Si ya está autenticado, permitir el acceso
    if (adminUser) {
      return true;
    }

    const { value: username, isConfirmed: userConfirmed } = await Swal.fire({
      title: 'Usuario administrador',
      input: 'text',
      inputLabel: 'Usuario',
      inputPlaceholder: 'Ingresa tu usuario',
      showCancelButton: true
    });

    if (!userConfirmed || !username) {
      this.router.navigate(['/']);
      return false;
    }

    const { value: password, isConfirmed: passConfirmed } = await Swal.fire({
      title: 'Contraseña',
      input: 'password',
      inputPlaceholder: 'Contraseña',
      showCancelButton: true
    });

    if (!passConfirmed || !password) {
      this.router.navigate(['/']);
      return false;
    }

    try {
      await firstValueFrom(this.authService.loginAdmin(username, password));
      localStorage.setItem('adminUser', username); // Puedes cifrar esto si quieres más seguridad
      return true;
    } catch {
      Swal.fire('Error', 'Credenciales inválidas o no eres administrador.', 'error');
      this.router.navigate(['/']);
      return false;
    }
  }
}
