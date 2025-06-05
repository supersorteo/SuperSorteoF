import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CodigoVip } from '../interfaces/codigo-vip';

@Injectable({
  providedIn: 'root'
})
export class CodigoVipServiceService {

 private apiUrl = 'http://localhost:8080/codigos-vip';
 //private apiUrl = 'https://pruebaback-5.onrender.com/codigos-vip';
  constructor(private http: HttpClient) {}

  generarCodigoVip(cantidadRifas: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, null, { params: { cantidadRifas } });
  }

  obtenerCodigosVip(): Observable<CodigoVip[]> {
    return this.http.get<CodigoVip[]>(this.apiUrl);
  }
}
