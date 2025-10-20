import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthenticationService } from '../../services/authentication.service';
import { passwordsMatchValidator } from '../../interfaces/passwordsMatchValidator';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import Swal from 'sweetalert2';
import { User } from '../../interfaces/user';
import { InputMaskModule } from 'primeng/inputmask';
import { PasswordModule } from 'primeng/password';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, InputTextModule,
    ButtonModule, DialogModule, ReactiveFormsModule, CalendarModule, InputMaskModule, PasswordModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  rightPanelActive: boolean = false;
  registerForm!: FormGroup;
  loginForm!: FormGroup;
  recoveryForm!: FormGroup;
  changePasswordForm!: FormGroup;
  displayRecoveryDialog: boolean = false;
  displayChangePasswordDialog: boolean = false;

  codigoRecuperacion: string = '';

  recoveryEmail: string = ''
  displayDialog: boolean = false;
  isLogin: boolean = true;
  togglePanel() {
    this.rightPanelActive = !this.rightPanelActive;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required]],

      telefono: ['', [
        Validators.required,
        Validators.pattern(/^\+54 9 \d{2} \d{4}-\d{4}$/)
      ]],



    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

      this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

      this.changePasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      codigo: ['', [Validators.required]],
      nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmarNuevaPassword: ['', [Validators.required]]
    });
  }


  ngOnInit(): void {}



showRecoveryDialog(): void {
  this.displayRecoveryDialog = true;
  this.recoveryForm.reset();
}

hideRecoveryDialog(): void {
  this.displayRecoveryDialog = false;
}

showChangePasswordDialog(email: string): void {
  this.displayChangePasswordDialog = true;
  this.changePasswordForm.patchValue({ email });
}

hideChangePasswordDialog(): void {
  this.displayChangePasswordDialog = false;
}

  hideDialog(): void {
    this.displayDialog = false;
    this.recoveryEmail = '';
  }

  showDialog(): void {
    this.displayDialog = true;
  }

  toggle() {
    this.isLogin = !this.isLogin;
  }

  onSignup(): void {
    if (this.registerForm.valid) {
      const user: User = this.registerForm.value;
      this.authService.register(user).subscribe(
        (res) => {

          Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            text: 'Usuario registrado con éxito.'
          })
          .then(
            () => {
              this.registerForm.reset();
              //this.authService.logout();
              this.router.navigate(['/login']);
            });
          },
          (error) => {
            this.showRegistrationError(error);
          } );
        } else {
          this.showClientSideErrors();
        }
      }




  private showRegistrationError(error: string): void {
    if (error.includes('El correo ya está registrado')) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El correo ya está registrado.'
      });
    }
    else if (error.includes('Las contraseñas no coinciden')) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden.'
      });
    }
    else { Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error || 'Error desconocido.'
    });
  }
}

  private showClientSideErrors(): void {
    if (this.registerForm.get('name')?.errors?.['required']) {
      this.showErrorAlert('Debe ingresar un nombre.');
    } else if (this.registerForm.get('name')?.errors?.['pattern']) {
      this.showErrorAlert('El nombre debe ser un string.');
    } else if (this.registerForm.get('email')?.errors?.['required']) {
      this.showErrorAlert('Debe ingresar un correo electrónico.');
    } else if (this.registerForm.get('email')?.errors?.['email']) {
      this.showErrorAlert('Formato de correo electrónico incorrecto.');
    } else if (this.registerForm.get('password')?.errors?.['required']) {
      this.showErrorAlert('Debe ingresar una contraseña.');
    } else if (this.registerForm.get('password')?.errors?.['minlength']) {
      this.showErrorAlert('La contraseña debe tener al menos 6 caracteres.');
    } else if (this.registerForm.get('confirmarPassword')?.errors?.['required']) {
      this.showErrorAlert('Debe llenar el campo de confirmar contraseña.');
    }else if (this.registerForm.get('telefono')?.hasError('required')) {
      this.showErrorAlert('Debe ingresar un teléfono.');
    } else if (this.registerForm.get('telefono')?.hasError('pattern')) {
      this.showErrorAlert('Formato de teléfono inválido.');
    }

    else { this.showErrorAlert('Error desconocido.');

    }
  }





     onLogin(): void {
  if (this.loginForm.valid) {
    const user: { email: string, password: string } = this.loginForm.value;

    this.authService.login(user).subscribe({
      next: (res) => {
        console.log("✅ Usuario logueado:", res.usuario);
        console.log("🔍 ¿Es primer login?", res.primerInicioSesion);

        // 🔥 Guardamos el usuario en `localStorage`
        localStorage.setItem('currentUser', JSON.stringify(res.usuario));
        localStorage.setItem('primerInicioSesion', JSON.stringify(res.primerInicioSesion));

        // 🔥 Si es la primera vez que inicia sesión, mostrar un mensaje especial
        if (res.primerInicioSesion) {
         /* Swal.fire({
            icon: "info",
            title: "¡Bienvenido!",
            text: "Este es tu primer inicio de sesión. ¡Explora el sistema!",
            confirmButtonText: "Aceptar"
          });*/
          console.log("Este es tu primer inicio de sesión.")

        }

        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.showLoginError(error);
      }
    });
  } else {
    this.showClientSideErrorsLogin();
  }
}


    private showLoginError(error: string): void {
          if (error.includes('Error: Usuario no encontrado')) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Usuario no encontrado.'
            });
          }
          else if (error.includes('Error: Contraseña incorrecta')) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Contraseña incorrecta.'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error || 'Error desconocido.'
            });
          }
        }

        private showClientSideErrorsLogin(): void {
          if (this.loginForm.get('email')?.errors?.['required']) {
            this.showErrorAlert('Debe ingresar un correo electrónico.');
          } else if (this.loginForm.get('email')?.errors?.['email']) {
            this.showErrorAlert('Formato de correo electrónico incorrecto.');
          } else if (this.loginForm.get('password')?.errors?.['required']) {
            this.showErrorAlert('Debe ingresar una contraseña.');
          } else if (this.loginForm.get('password')?.errors?.['minlength']) {
            this.showErrorAlert('La contraseña debe tener al menos 6 caracteres.');
          } else {
            this.showErrorAlert('Error desconocido.');
          }
        }

        private showErrorAlert(message: string): void {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message
          });
        }




onRecuperar(): void {
  if (this.recoveryForm.valid) {
    const email = this.recoveryForm.get('email')?.value;
    this.hideRecoveryDialog()
    Swal.fire({
      title: 'Enviando código...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.authService.recoverPassword(email).subscribe({
      next: (codigo) => {
        Swal.close();

        Swal.fire({
          icon: 'success',
          title: 'Código Enviado',
          html: `
            <p>Se ha enviado un código de recuperación a:</p>
            <strong>${email}</strong>
            <p class="mt-3">Revisa tu correo electrónico (incluyendo SPAM)</p>
          `,
          confirmButtonText: 'Continuar'
        }).then(() => {
          this.hideRecoveryDialog();
          this.showChangePasswordDialog(email);
        });
      },
      error: () => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El correo no está registrado o hubo un problema...'
        });
      }
    });
  }
}


onChangePassword(): void {
  if (this.changePasswordForm.valid) {
    const email = this.changePasswordForm.get('email')?.value;
    const codigo = this.changePasswordForm.get('codigo')?.value.trim();
    const nuevaPassword = this.changePasswordForm.get('nuevaPassword')?.value;
    const confirmarNuevaPassword = this.changePasswordForm.get('confirmarNuevaPassword')?.value;

    // Validar que las contraseñas coincidan
    if (nuevaPassword !== confirmarNuevaPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }
    this.hideChangePasswordDialog();
    Swal.fire({
      title: 'Cambiando contraseña...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.authService.changePassword(email, codigo, nuevaPassword).subscribe({
      next: (success) => {
        Swal.close();

        if (success) {
          Swal.fire({
            icon: 'success',
            title: '¡Contraseña Cambiada!',
            text: 'Tu contraseña ha sido actualizada exitosamente.',
            confirmButtonText: 'Ir a Login'
          }).then(() => {
            this.hideChangePasswordDialog();
            this.changePasswordForm.reset();
            this.isLogin = true;
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El código es incorrecto o ha expirado.'
          });

        }
      },
      error: () => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al cambiar la contraseña.'
        });
      }
    });
  }
}



}
