import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { PaymentServiceService } from '../../services/payment-service.service';
import { PaymentOption } from '../../interfaces/payment-option';
import { Banco } from '../../interfaces/banco';
import { TableModule } from 'primeng/table';
import { AuthenticationService } from '../../services/authentication.service';



@Component({
  selector: 'app-fpagos',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, DialogModule, InputTextModule, FormsModule, DropdownModule, ReactiveFormsModule, TableModule],
  templateUrl: './fpagos.component.html',
  styleUrl: './fpagos.component.scss'
})
export class FpagosComponent implements OnInit {

metodoPago: boolean= false
lista: boolean = false;
bancos: Banco[] | undefined;
selectedBancos: Banco | undefined;
paymentForm!: FormGroup;

editingId: number | undefined = undefined;
paymentOptions: PaymentOption[] = [];


  private defaultBanks: Banco[] = [
    { name: 'Mercado Pago', code: 'MP', image: 'assets/bancos/MP.jpg' },
    { name: 'Ulala', code: 'UL', image: 'assets/bancos/ulala.jpg' },
    { name: 'Naranja X', code: 'NX', image: 'assets/bancos/naranjax.jpg' },
    { name: 'Banco Nacion', code: 'BN', image: 'assets/bancos/banconacion.jpg' },
    { name: 'Banco Galicia', code: 'BG', image: 'assets/bancos/galicia.jpg' },
    { name: 'Brubank', code: 'BB', image: 'assets/bancos/brubank.jpg' },
    { name: 'Rebanking', code: 'RK', image: 'assets/bancos/reba.jpg' },
    { name: 'Cuenta DNI', code: 'CD', image: 'assets/bancos/dni.jpg' },
    { name: 'Otras', code: 'OT', image: 'assets/bancos/galicia.jpg' },
  ];

constructor(private fb: FormBuilder, private paymentService: PaymentServiceService, private authService: AuthenticationService) {

    this.paymentForm = this.fb.group({
      bancoSeleccionado: [null, Validators.required],
      alias: ['', Validators.required],
      cbu: ['', [Validators.required, Validators.pattern(/^\d{22}$/)]], // Valida CBU de 22 dígitos
    });
  }


  ngOnInit(): void {


    this.bancos = [...this.defaultBanks];
console.log('ngOnInit: Bancos por defecto asignados:', this.bancos);

this.loadPayments();

  }




loadPayments(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.paymentService.getPaymentOptionsByUsuarioId(currentUser.id).subscribe({
        next: (data: PaymentOption[]) => {
          this.paymentOptions = [...data];
          console.log('loadPayments: Datos cargados para usuario:', currentUser.id, data);
        },
        error: (err) => {
          console.error('loadPayments: Error al cargar opciones de pago:', err);
          Swal.fire('Error', 'No se pudieron cargar las opciones de pago.', 'error');
        }
      });
    } else {
      this.paymentOptions = [];
      console.warn('Usuario no autenticado, no se cargan métodos de pago.');
      Swal.fire('Error', 'Debes iniciar sesión para ver tus métodos de pago.', 'error');
    }
  }


mostrar(id?: number): void {
  this.metodoPago = true;
  this.editingId = id; // Aseguramos que editingId se establece
  this.paymentForm.reset();
  console.log('mostrar: editingId asignado:', id);

  if (id !== undefined) {
    this.paymentService.getPaymentOptionById(id).subscribe({
      next: (data: PaymentOption) => {
        console.log('Datos recibidos de getPaymentOptionById:', data);
        this.selectedBancos = this.defaultBanks.find(b => b.code === data.bankCode);
        if (this.selectedBancos) {
          this.paymentForm.patchValue({
            bancoSeleccionado: this.selectedBancos,
            alias: data.alias,
            cbu: data.cbu,
          });
          console.log('Formulario actualizado con:', this.paymentForm.value);
          // Forzamos la detección de cambios para el dropdown
          setTimeout(() => {
            this.paymentForm.get('bancoSeleccionado')?.updateValueAndValidity();
          }, 0);
        } else {
          console.warn('No se encontró banco con code:', data.bankCode);
        }
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo cargar la opción para edición.', 'error');
      }
    });
  } else {
    this.selectedBancos = undefined;
  }
}





  hideListDialog(): void { // Método añadido para cerrar el modal de lista
    this.lista = false;
  }

  listar(): void {
    this.loadPayments();
    this.lista = true;
  }

hideDialog(){
  this.lista = false;
  this.metodoPago = false;
 this.editingId = undefined;
}






onSubmit0(): void {
  if (this.paymentForm.valid) {
    const formData = this.paymentForm.value;
    const paymentData: PaymentOption = {
      id: this.editingId,
      bankCode: formData.bancoSeleccionado.code,
      alias: formData.alias,
      cbu: formData.cbu,
    };

    this.paymentService.savePaymentOption(paymentData).subscribe({
      next: (response: PaymentOption) => {
        this.loadPayments(); // Actualiza inmediatamente
        this.paymentOptions = [...this.paymentOptions.filter(opt => opt.id !== this.editingId), response]; // Actualiza localmente
        console.log('Datos del pago guardados:', response);
        Swal.fire({
          title: '¡Éxito!',
          text: `La opción de pago ${this.editingId ? 'actualizada' : 'guardada'} correctamente. Detalles: Banco: ${paymentData.bankCode}, Alias: ${paymentData.alias}, CBU: ${paymentData.cbu}`,
          icon: 'success',
          confirmButtonText: 'Aceptar',
          timer: 5000,
        }).then(() => this.hideDialog());
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo guardar la opción de pago.', 'error');
      }
    });
  } else {
    Swal.fire({
      title: 'Error de validación',
      text: 'Por favor, completa todos los campos correctamente. El CBU debe tener exactamente 22 dígitos.',
      icon: 'error',
      confirmButtonText: 'Corregir',
    });
  }
  this.hideDialog();

}

onSubmit(): void {
  if (this.paymentForm.valid) {
    const formData = this.paymentForm.value;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.id) {
      Swal.fire({
        title: 'Error',
        text: 'Debes iniciar sesión para crear un método de pago.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      })
      return;
    }

    const paymentData: PaymentOption = {
      id: this.editingId,
      bankCode: formData.bancoSeleccionado.code,
      alias: formData.alias,
      cbu: formData.cbu,
      usuarioId: currentUser.id // Aseguramos que se envíe el id del usuario autenticado
    };

    this.paymentService.savePaymentOption(paymentData).subscribe({
      next: (response: PaymentOption) => {
        this.loadPayments();
        this.paymentOptions = [...this.paymentOptions.filter(opt => opt.id !== this.editingId), response];
        console.log('Datos del pago guardados:', response);
        Swal.fire({
          title: '¡Éxito!',
          text: `La opción de pago ${this.editingId ? 'actualizada' : 'guardada'} correctamente. Detalles: Banco: ${paymentData.bankCode}, Alias: ${paymentData.alias}, CBU: ${paymentData.cbu}`,
          icon: 'success',
          confirmButtonText: 'Aceptar',
          timer: 5000,
        }).then(() => this.hideDialog());
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo guardar la opción de pago.', 'error');
      }
    });
  } else {
    Swal.fire({
      title: 'Error de validación',
      text: 'Por favor, completa todos los campos correctamente. El CBU debe tener exactamente 22 dígitos.',
      icon: 'error',
      confirmButtonText: 'Corregir',
    });
  }
  this.hideDialog();
}


// Añadir estos métodos dentro de la clase
getBankImage(bankCode: string): string {
  const bank = this.defaultBanks.find(b => b.code === bankCode);
  return bank ? bank.image : 'assets/bancos/default.jpg';
}

getBankName(bankCode: string): string {
  const bank = this.defaultBanks.find(b => b.code === bankCode);
  return bank ? bank.name : bankCode;
}

onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/bancos/default.jpg'; // Ruta a una imagen por defecto si falla
  }


deletePayment0(id: number): void {
  if (id === undefined) {
    console.error('deletePayment: ID is undefined');
    return;
  }
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'swal2-popup-custom' // Clase personalizada
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.paymentService.deletePaymentOption(id).subscribe({
        next: () => {
          this.loadPayments();
          Swal.fire('Eliminado', 'La opción de pago ha sido eliminada.', 'success');
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo eliminar la opción de pago.', 'error');
        }
      });
    }
  });
  this.hideDialog();
}

deletePayment(id: number): void {
    if (id === undefined) {
      console.error('deletePayment: ID is undefined');
      return;
    }
    const currentUserId = this.authService.getCurrentUser()?.id;
    const paymentToDelete = this.paymentOptions.find(opt => opt.id === id);
    if (paymentToDelete && paymentToDelete.usuarioId !== currentUserId) {
      Swal.fire('Error', 'No tienes permiso para eliminar este método de pago.', 'error');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.paymentService.deletePaymentOption(id).subscribe({
          next: () => {
            this.loadPayments();
            Swal.fire('Eliminado', 'La opción de pago ha sido eliminada.', 'success');
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo eliminar la opción de pago.', 'error');
          }
        });
      }
    });
    this.hideDialog();
  }

}
