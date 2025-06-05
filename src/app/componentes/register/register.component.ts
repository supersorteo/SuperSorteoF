import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, InputTextModule, ButtonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm!: FormGroup;

  constructor( private fb: FormBuilder, private authService: AuthService, private router: Router ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onSubmit1(): void {
    if (this.registerForm.valid) {
      const user: User = this.registerForm.value;
      this.authService.register(user).subscribe(
        (res) => {
          console.log(res)
          Swal.fire('¡Usuario registrado con éxito!', res, 'success');
          this.registerForm.reset();
        },
        (error) => {
          Swal.fire('Error', error, 'error');
        }
      );
    } else {
      Swal.fire('Error', 'Por favor completa todos los campos correctamente.', 'error');
    }
  }

  onSubmit(): void { if (this.registerForm.valid) {
    const user: User = this.registerForm.value;
    this.authService.register(user).subscribe(
       (res) => {
        Swal.fire({ icon: 'success', title: '¡Registro exitoso!', text: 'Usuario registrado con éxito.' }).then(() => {
          this.registerForm.reset();
          this.router.navigate(['/dashboard']); }); }, (error) => { this.showRegistrationError(error); } ); } else { this.showClientSideErrors(); } }
  private showRegistrationError(error: string): void { if (error.includes('El correo ya está registrado')) { Swal.fire({ icon: 'error', title: 'Error', text: 'El correo ya está registrado.' }); } else if (error.includes('Las contraseñas no coinciden')) { Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden.' }); } else { Swal.fire({ icon: 'error', title: 'Error', text: error || 'Error desconocido.' }); } }
  private showClientSideErrors(): void { if (this.registerForm.get('name')?.errors?.['required']) { this.showErrorAlert('Debe ingresar un nombre.'); } else if (this.registerForm.get('name')?.errors?.['pattern']) { this.showErrorAlert('El nombre debe ser un string.'); } else if (this.registerForm.get('email')?.errors?.['required']) { this.showErrorAlert('Debe ingresar un correo electrónico.'); } else if (this.registerForm.get('email')?.errors?.['email']) { this.showErrorAlert('Formato de correo electrónico incorrecto.'); } else if (this.registerForm.get('password')?.errors?.['required']) { this.showErrorAlert('Debe ingresar una contraseña.'); } else if (this.registerForm.get('password')?.errors?.['minlength']) { this.showErrorAlert('La contraseña debe tener al menos 6 caracteres.'); } else if (this.registerForm.get('confirmPassword')?.errors?.['required']) { this.showErrorAlert('Debe llenar el campo de confirmar contraseña.'); } else { this.showErrorAlert('Error desconocido.'); } } private showErrorAlert(message: string): void { Swal.fire({ icon: 'error', title: 'Error', text: message }); }

}
