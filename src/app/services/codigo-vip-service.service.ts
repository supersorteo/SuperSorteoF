import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CodigoVip } from '../interfaces/codigo-vip';

@Injectable({
  providedIn: 'root'
})
export class CodigoVipServiceService {

 //private apiUrl = 'http://localhost:8080/codigos-vip';
 private apiUrl = 'https://sweet-laughter-production.up.railway.app/codigos-vip';
  constructor(private http: HttpClient) {}

  generarCodigoVip(cantidadRifas: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, null, { params: { cantidadRifas } });
  }

  obtenerCodigosVip(): Observable<CodigoVip[]> {
    return this.http.get<CodigoVip[]>(this.apiUrl);
  }

  generarPreferenciaPago(cantidadRifas: number, usuarioId: number): Observable<any> {
  const payload = {
    cantidadRifas,
    usuarioId
  };

  //return this.http.post<any>('https://sweet-laughter-production.up.railway.app/codigos-vip/pago', payload);
  return this.http.post<any>(`${this.apiUrl}/pago`, payload);
}

getSoldCodes(): Observable<CodigoVip[]> {
    return this.http.get<CodigoVip[]>(`${this.apiUrl}/vendidos`);
  }

}
