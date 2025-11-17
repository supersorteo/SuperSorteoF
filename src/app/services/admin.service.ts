import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { Observable } from 'rxjs';
import { Raffle } from '../interfaces/raffle';
import { AuthenticationService } from './authentication.service';
import { RaffleService } from './raffle.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'https://sweet-laughter-production.up.railway.app'; // Usa tu URL de producción
  //private apiUrl = 'http://localhost:8080';
  constructor(
    private authService: AuthenticationService,
    private raffleService: RaffleService
  ) {}

 // Obtener todos los usuarios (usa AuthenticationService)
  getAllUsers(): Observable<User[]> {
    console.log('🔍 Cargando todos los usuarios desde AuthenticationService...');
    const obs = this.authService.getUsers();
    obs.subscribe({
      next: (users) => console.log('✅ Usuarios cargados:', users),
      error: (error) => console.error('❌ Error al cargar usuarios:', error)
    });
    return obs;
  }

  // Obtener rifas por usuario ID (usa RaffleService)
  getRafflesByUserId(userId: number): Observable<Raffle[]> {
    console.log(`🔍 Cargando rifas para usuario ID ${userId} desde RaffleService...`);
    const obs = this.raffleService.getRafflesByUser(userId);
    obs.subscribe({
      next: (raffles) => console.log(`✅ Rifas cargadas para usuario ${userId}:`, raffles),
      error: (error) => console.error(`❌ Error al cargar rifas para usuario ${userId}:`, error)
    });
    return obs;
  }

  updateUser(user: User): Observable<User> {
    console.log(`✏️ Actualizando usuario ID ${user.id}:`, user);
    const obs = this.authService.updateUser(user);
    obs.subscribe({
      next: (updatedUser) => console.log('✅ Usuario actualizado:', updatedUser),
      error: (error) => console.error('❌ Error al actualizar usuario:', error)
    });
    return obs;
  }

  // Eliminar usuario (usa AuthenticationService)
deleteUser0(id: number): Observable<string> {
  console.log(`🗑️ Eliminando usuario ID ${id}`);
  const obs = this.authService.deleteUser(id);
  obs.subscribe({
    next: (message) => console.log('✅ Usuario eliminado:', message),
    error: (error) => console.error('❌ Error al eliminar usuario:', error)
  });
  return obs;
}

deleteUser(id: number): Observable<string> { // Cambia tipo a string
  console.log(`🗑️ Eliminando usuario ID ${id}`);
  return this.authService.deleteUser(id); // Retorna Observable sin suscribirse
}
}
