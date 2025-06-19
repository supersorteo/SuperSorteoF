import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

   private readonly baseUrl = 'https://sweet-laughter-production.up.railway.app/api/admin';
  constructor(private http: HttpClient) {}

  // 🔐 Login de administrador
  loginAdmin(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { username, password });
  }

  // 🔁 Cambiar contraseña
  cambiarPassword0(username: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/password`, { username, newPassword });
  }

  cambiarPassword1(username: string, newPassword: string): Observable<string> {
  return this.http.put(`${this.baseUrl}/password`, { username, newPassword }, { responseType: 'text' });
}

  cambiarPassword(username: string, newPassword: string): Observable<{ success: boolean, message: string }> {
    return this.http.put<{ success: boolean, message: string }>(
      `${this.baseUrl}/password`,
      { username, newPassword }
    );
  }

}
