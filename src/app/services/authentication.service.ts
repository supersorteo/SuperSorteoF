import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, map, Observable, throwError } from 'rxjs';
import { User } from '../interfaces/user';
import { environment } from '../../environment/environment';





@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {


  private apiUrl = 'http://localhost:8080/usuarios';

  //private apiUrl = 'https://pruebaback-5.onrender.com/usuarios'
  //private apiUrl =  `${environment.API_BASE_URL}/usuarios`

  private readonly CURRENT_USER_KEY = 'currentUser';
  constructor(private http: HttpClient) { }

  // Método para registrar un usuario
  register(user: User): Observable<User> {
    // Enviamos una solicitud POST al backend con los datos del usuario
    return this.http.post<User>(`${this.apiUrl}`, user).pipe(
      // Manejo de errores
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMsg = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMsg = `Error: ${error.error.message}`;
    } else {
      errorMsg = error.error || 'Error desconocido';
    } return throwError(errorMsg);
  }

  private handleError1(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente (por ejemplo, red o navegador)
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      console.error('Error completo:', error); // Imprime el error completo
      errorMessage = error.error?.message || error.error || 'Error en el servidor';
    }
    return throwError(errorMessage); // Lanza el error para que el componente lo maneje
  }



   // Método para iniciar sesión
   login(credentials: { email: string, password: string }): Observable<User> {
    // Enviamos una solicitud POST al backend con las credenciales
    return this.http.post<User>(`${this.apiUrl}/login`, credentials).pipe(
      // Manejo de errores
      catchError(this.handleError1)
    );
  }




  isUserLoggedIn(): boolean {
    const currentUser = localStorage.getItem(this.CURRENT_USER_KEY);
    return currentUser !== null;
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  getCurrentUser(): any {
    const currentUser = localStorage.getItem(this.CURRENT_USER_KEY);
    return currentUser ? JSON.parse(currentUser) : null;
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  // Método para actualizar un usuario (PUT)
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user).pipe(
      catchError(this.handleError1) // Manejo de errores
    );
  }

  // Método para eliminar un usuario (DELETE)
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError1) // Manejo de errores
    );
  }


  recoverPassword1(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/recover-password`, { email }).pipe(
      catchError(
        error => {
          console.error('Error al enviar correo de recuperación', error);
          return throwError(error);
        })
      );
    }

    recoverPassword(email: string): Observable<void> {
      return this.http.post<void>(`${this.apiUrl}/recover-password`, { email }).pipe(catchError(this.handleError));
    }


}
