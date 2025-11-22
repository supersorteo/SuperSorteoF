import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';

import Swal from 'sweetalert2';
import { User } from '../../interfaces/user';
import { Raffle } from '../../interfaces/raffle';
import { AuthenticationService } from '../../services/authentication.service';
import { RaffleService } from '../../services/raffle.service';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CarouselModule } from 'primeng/carousel';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router } from '@angular/router';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { CodigoVip } from '../../interfaces/codigo-vip';
import { CodigoVipServiceService } from '../../services/codigo-vip-service.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, InputTextModule, ConfirmDialogModule,
    CheckboxModule, ReactiveFormsModule, TooltipModule, TagModule, ToolbarModule, ToastModule, CarouselModule, CardModule

  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {

  @ViewChild('dt') dt: any;
  users: User[] = [];
  selectedRaffles: Raffle[] = [];
  loading = true;
  showRafflesDialog = false;
  selectedUser: User | null = null;
  selectedUsers: User[] = [];
  // Para el modal de edición
  showEditDialog = false;
  editForm: FormGroup;
  editingUser: User | null = null;
  responsiveOptions!: any[];

  soldCodes: CodigoVip[] = []; // Lista códigos vendidos
  showSoldCodesDialog = false;
  totalPrecio: number = 0;
  constructor(
    private authService: AuthenticationService, // Llamadas directas
    private raffleService: RaffleService, // Llamadas directas
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private codigoVipService: CodigoVipServiceService
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      esVip: [false],
      cantidadRifas: [1, Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('🛠️ Inicializando componente de administración...');
    this.loadAllUsers();

    this.responsiveOptions = [
  {
    breakpoint: '1199px',
    numVisible: 1,
    numScroll: 1
  },
  {
    breakpoint: '575px',
    numVisible: 1,
    numScroll: 1
  }
];

  }

  // Cargar todos los usuarios (llamada directa a AuthenticationService)
  loadAllUsers(): void {
    console.log('🔍 Iniciando carga de usuarios...');
    this.loading = true;
    this.authService.getUsers().subscribe({
      next: (users) => {
        console.log('✅ Usuarios cargados exitosamente:', users.length);
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios:', error);
        this.loading = false;
      }
    });
  }

  // Cargar rifas para un usuario específico (llamada directa a RaffleService)
  loadRafflesForUser(userId: number): void {
    console.log(`🔍 Cargando rifas para usuario ID ${userId}...`);
    this.raffleService.getRafflesByUser(userId).subscribe({
      next: (raffles) => {
        console.log(`✅ Rifas cargadas para usuario ${userId}:`, raffles.length);
        this.selectedRaffles = raffles;
        this.selectedUser = this.users.find(u => u.id === userId) || null;
        this.showRafflesDialog = true;
        console.log(`✅ Rifas cargadas para usuario ${userId}:`, raffles);
      },
      error: (error) => {
        console.error(`❌ Error al cargar rifas para usuario ${userId}:`, error);
        this.selectedRaffles = [];
        this.showRafflesDialog = false;
      }
    });
  }

deleteSelectedUsers(): void {
  console.log('🔍 Iniciando deleteSelectedUsers...');
  console.log('Usuarios seleccionados:', this.selectedUsers);

  if (!this.selectedUsers || this.selectedUsers.length === 0) {
    console.log('⚠️ No hay usuarios seleccionados, saliendo...');
    Swal.fire('Advertencia', 'Selecciona al menos un usuario.', 'warning');
    return;
  }

  console.log('📋 Mostrando confirmación para eliminar ' + this.selectedUsers.length + ' usuarios...');
  Swal.fire({
    title: 'Confirmar Eliminación',
    text: '¿Estás seguro de que quieres eliminar los usuarios seleccionados? Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      console.log('✅ Usuario confirmó eliminación, iniciando loop...');
      let deletedCount = 0;
      let errorCount = 0;

      this.selectedUsers.forEach((user, index) => {
        console.log(`🔄 Procesando usuario ${index + 1}/${this.selectedUsers.length}: ID ${user.id}, Nombre ${user.name}`);
        if (user.id) {
          this.authService.deleteUser(user.id).subscribe({
            next: (message) => {
              console.log(`✅ Usuario ID ${user.id} eliminado exitosamente: ${message}`);
              deletedCount++;
            },
            error: (error) => {
              console.error(`❌ Error al eliminar usuario ID ${user.id}:`, error);
              errorCount++;
            }
          });
        } else {
          console.error(`⚠️ Usuario sin ID:`, user);
        }
      });

      console.log('🧹 Actualizando tabla: Filtrando usuarios eliminados...');
      this.users = this.users.filter(u => !this.selectedUsers.some(s => s.id === u.id));
      console.log('Tabla actualizada, usuarios restantes:', this.users.length);

      console.log('🗑️ Limpiando selección...');
      this.selectedUsers = [];
      console.log('Finalizando: Eliminados ' + deletedCount + ', Errores ' + errorCount);
      //Swal.fire('Éxito', `${deletedCount} usuarios eliminados`, 'success');
      Swal.fire('Éxito', `${this.selectedUsers} usuarios eliminados`, 'success');
    } else {
      console.log('❌ Usuario canceló eliminación.');
    }
  });
}

  // Abrir modal de edición


  editUser(user: User): void {
  if (!user.id) {
    console.error('❌ ID del usuario no definido:', user);
    return;
  }

  console.log(`✏️ Editando usuario ID ${user.id}:`, user);

  // 🔥 Fetch usuario fresco del backend para datos actualizados
  this.authService.getUserById(user.id).subscribe({
    next: (userFresco) => {
      console.log('Usuario fresco del backend:', userFresco);
      this.editingUser = { ...userFresco };
      this.editForm.patchValue({
        name: userFresco.name,
        email: userFresco.email,
        telefono: userFresco.telefono,
        esVip: userFresco.esVip,
        cantidadRifas: userFresco.cantidadRifas || 1  // Patch real (ej. 8)
      });
      this.showEditDialog = true;
    },
    error: (error) => {
      console.error('Error al recargar usuario para edición:', error);
      // Fallback: Usa user local
      this.editingUser = { ...user };
      this.editForm.patchValue({
        name: user.name,
        email: user.email,
        telefono: user.telefono,
        esVip: user.esVip,
        cantidadRifas: user.cantidadRifas || 1
      });
      this.showEditDialog = true;
      Swal.fire('Advertencia', 'Datos del usuario no se pudieron recargar, usando datos locales.', 'warning');
    }
  });
}


  // Guardar cambios del usuario (llamada directa a AuthenticationService)


  saveEditedUser(): void {
  if (this.editForm.invalid || !this.editingUser) {
    console.error('Formulario de edición inválido');
    return;
  }

  const updatedUser: User = { ...this.editingUser, ...this.editForm.value };
  console.log('💾 Guardando usuario actualizado:', updatedUser);

  this.authService.updateUser(updatedUser).subscribe({
    next: (user) => {
      console.log('✅ Usuario actualizado del backend:', user);
      // 🔥 Recarga lista completa para datos frescos
      this.loadAllUsers(); // Recarga todos los usuarios (incluyendo cambios)
      this.showEditDialog = false;
      this.editForm.reset();
      Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
    },
    error: (error) => {
      console.error('❌ Error al actualizar usuario:', error);
      Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
    }
  });
}

  // Eliminar usuario (llamada directa a AuthenticationService)
  deleteUser(user: User): void {
    if (!user.id) {
      console.error('❌ ID del usuario no definido:', user);
      Swal.fire('Error', 'No se puede eliminar el usuario sin ID válido.', 'error');
      return;
    }

    console.log(`🗑️ Eliminando usuario ID ${user.id}:`, user);
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás al usuario "${user.name}" y todas sus rifas asociadas.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.deleteUser(user.id).subscribe({
          next: () => {
            console.log('✅ Usuario eliminado exitosamente');
            this.users = this.users.filter(u => u.id !== user.id); // Actualiza la tabla
            Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
          },
          error: (error) => {
            console.error('❌ Error al eliminar usuario:', error);
            Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
          }
        });
      }
    });
  }



deleteRaffle(id: number): void {
  if (!id) {
    console.error('❌ ID de rifa no definido');
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se puede eliminar la rifa sin ID válido.', life: 3000 });
    return;
  }

  console.log(`🗑️ Eliminando rifa ID ${id}...`);
  this.confirmationService.confirm({
    message: '¿Estás seguro de que quieres eliminar esta rifa y todos sus datos asociados?',
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    accept: () => {
      // Elimina imágenes (opcional, maneja errores)
      const raffle = this.selectedRaffles.find(r => r.id === id);
      if (raffle && raffle.producto.imagenes) {
        const imageDeletions = raffle.producto.imagenes.map(imageUrl => {
          const fileName = imageUrl.split('/').pop()!;
          return this.raffleService.deleteImage(fileName).pipe(
            catchError((error) => {
              console.warn('Imagen no encontrada, ignorando:', fileName, error);
              return of(null);
            })
          );
        });

        forkJoin(imageDeletions).pipe(
          switchMap(() => this.raffleService.deleteRaffle(id))
        ).subscribe({
          next: () => {
            console.log('✅ Rifa eliminada exitosamente');
            this.selectedRaffles = this.selectedRaffles.filter(r => r.id !== id); // Actualiza carrusel

            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rifa eliminada correctamente', life: 3000 });
          },
          error: (error) => {
            console.error('❌ Error al eliminar rifa:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la rifa', life: 3000 });
          }
        });
      } else {
        // Si no hay imágenes, elimina rifa directo
        this.raffleService.deleteRaffle(id).subscribe({
          next: () => {
            console.log('✅ Rifa eliminada exitosamente');
            this.selectedRaffles = this.selectedRaffles.filter(r => r.id !== id);

            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rifa eliminada correctamente', life: 3000 });
          },
          error: (error) => {
            console.error('❌ Error al eliminar rifa:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la rifa', life: 3000 });
          }
        });
      }
    },
    reject: () => {
      console.log('❌ Usuario canceló eliminación de rifa.');
    }
  });
}

 logoutAdmin(): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: '¿Quieres cerrar sesión?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'No, permanecer'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('adminUser');
      this.router.navigate(['/']);
      Swal.fire('¡Cerrado!', 'Tu sesión ha sido cerrada', 'success');
    }
  });
}



    cambiarPassword(){
      this.router.navigate(['/cambiar-password-admin'])
    }

    loadSoldCodes(): void {
    this.codigoVipService.getSoldCodes().subscribe({
      next: (soldCodes) => {
        console.log('✅ Códigos vendidos cargados:', soldCodes.length);
        this.soldCodes = soldCodes;
        this.calculateTotalPrecio();
        this.showSoldCodesDialog = true;
      },
      error: (error) => {
        console.error('❌ Error al cargar códigos vendidos:', error);
        Swal.fire('Error', 'No se pudieron cargar los códigos vendidos.', 'error');
      }
    });
  }

  private calculateTotalPrecio(): void {
    this.totalPrecio = this.soldCodes.reduce((sum, code) => sum + (code.precio || 0), 0);
    console.log('Total precio calculado:', this.totalPrecio); // Log para debug
  }


}
