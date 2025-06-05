import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) { }

  register(user: User): Observable<string> { return this.http.post<string>(`${this.apiUrl}/register`, user).pipe( catchError(this.handleError) ); }
  private handleError(error: HttpErrorResponse): Observable<never> { let errorMsg = 'Error desconocido'; if (error.error instanceof ErrorEvent) { errorMsg = `Error: ${error.error.message}`; } else { errorMsg = error.error || 'Error desconocido'; } return throwError(errorMsg); }



}
