import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { PaymentOption } from '../interfaces/payment-option';
import { AuthenticationService } from './authentication.service';


@Injectable({
  providedIn: 'root'
})
export class PaymentServiceService {

 // private apiUrl = 'http://localhost:8080/api/payment-options';

  private apiUrl = 'https://sweet-laughter-production.up.railway.app/api/payment-options';

  private paymentOptionsSubject = new BehaviorSubject<PaymentOption[]>([]);
  public paymentOptions$ = this.paymentOptionsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthenticationService) { }



  getAllPaymentOptions(): Observable<PaymentOption[]> {
    return this.http.get<PaymentOption[]>(this.apiUrl).pipe(
      tap(data => this.paymentOptionsSubject.next(data))
    );
  }



  // Obtener una opción de pago por ID
  getPaymentOptionById(id: number): Observable<PaymentOption> {
    return this.http.get<PaymentOption>(`${this.apiUrl}/${id}`);
  }



savePaymentOption(paymentOption: PaymentOption): Observable<PaymentOption> {
    if (paymentOption.id) {
      return this.http.put<PaymentOption>(`${this.apiUrl}/${paymentOption.id}`, paymentOption).pipe(
        tap(() => {
          const currentUserId = this.authService.getCurrentUser()?.id || 0;
          this.getPaymentOptionsByUsuarioId(currentUserId).subscribe();
        })
      );
    } else {
      return this.http.post<PaymentOption>(this.apiUrl, paymentOption).pipe(
        tap(() => {
          const currentUserId = this.authService.getCurrentUser()?.id || 0;
          this.getPaymentOptionsByUsuarioId(currentUserId).subscribe();
        })
      );
  }
}

savePaymentOption0(paymentOption: PaymentOption): Observable<PaymentOption> {
    const url = paymentOption.id ? `${this.apiUrl}/${paymentOption.id}` : this.apiUrl;
    const method = paymentOption.id ? 'put' : 'post';
    console.log(`[Service] Saving payment option, method: ${method}, URL: ${url}`, paymentOption);
    return (this.http[method](url, paymentOption, { responseType: 'json' }) as Observable<PaymentOption>).pipe(
      tap(() => {
        const currentUserId = this.authService.getCurrentUser()?.id;
        if (currentUserId) {
          this.getPaymentOptionsByUsuarioId(currentUserId).subscribe(
            updatedData => this.paymentOptionsSubject.next(updatedData),
            err => console.error('[Service] Error updating payment options:', err)
          );
        }
      })
    );
  }







  getPaymentOptionsByUsuarioId0(usuarioId: number): Observable<PaymentOption[]> {
    console.log(`[Service] Fetching payment options for user ID: ${usuarioId}`);
    return this.http.get<PaymentOption[]>(`${this.apiUrl}/usuario/${usuarioId}`, { responseType: 'json' }).pipe(
      tap(data => {
        console.log('[Service] Received payment options:', data);
        this.paymentOptionsSubject.next(data);
      })
    );
  }

getPaymentOptionsByUsuarioId(usuarioId: number): Observable<PaymentOption[]> {
    console.log(`[Service] Fetching payment options for user ID: ${usuarioId}`);
    return this.http.get<PaymentOption[]>(`${this.apiUrl}/usuario/${usuarioId}`, { responseType: 'json' }).pipe(
      tap(data => {
        console.log('[Service] Received payment options from backend:', data);
        this.updateLocalStorageAndSubject(usuarioId, data);
      })
    );
  }




  deletePaymentOption(id: number): Observable<void> {
    console.log(`[Service] Deleting payment option with ID: ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { responseType: 'json' }).pipe(
      tap(() => {
        const currentUserId = this.authService.getCurrentUser()?.id;
        if (currentUserId) {
          this.getPaymentOptionsByUsuarioId(currentUserId).subscribe(
            updatedData => this.paymentOptionsSubject.next(updatedData),
            err => console.error('[Service] Error updating payment options after delete:', err)
          );
        }
      })
    );
  }

private updateLocalStorageAndSubject(usuarioId: number, data: PaymentOption[]) {
    const storageKey = `paymentOptions_${usuarioId}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
    this.paymentOptionsSubject.next(data);
    console.log(`[Service] Updated localStorage and BehaviorSubject for user ID: ${usuarioId}`, data);
  }

  getLocalPaymentOptions(usuarioId: number): PaymentOption[] {
    const storageKey = `paymentOptions_${usuarioId}`;
    const storedData = localStorage.getItem(storageKey);
    return storedData ? JSON.parse(storedData) : [];
  }

  // Método para forzar una actualización manual desde localStorage
  refreshFromLocalStorage(usuarioId: number) {
    const data = this.getLocalPaymentOptions(usuarioId);
    this.paymentOptionsSubject.next(data);
    console.log(`[Service] Refreshed from localStorage for user ID: ${usuarioId}`, data);
  }

private getCurrentUserId(): number | null {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? currentUser.id : null;
  }

}
