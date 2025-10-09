import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { PaymentOption } from '../interfaces/payment-option';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentServiceService {
  private apiUrl = 'https://sweet-laughter-production.up.railway.app/api/payment-options';
  //private apiUrl = 'http://localhost:8080/api/payment-options';
  private paymentOptionsSubject = new BehaviorSubject<PaymentOption[]>([]);
  public paymentOptions$ = this.paymentOptionsSubject.asObservable();
  private paymentOptionsMap = new Map<number, BehaviorSubject<PaymentOption[]>>();

  private refreshPaymentsSubject = new BehaviorSubject<number | null>(null);
  public refreshPayments$ = this.refreshPaymentsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthenticationService) {}

  getAllPaymentOptions(): Observable<PaymentOption[]> {
    return this.http.get<PaymentOption[]>(this.apiUrl).pipe(
      tap(data => this.paymentOptionsSubject.next(data))
    );
  }

  getPaymentOptionsSubject(usuarioId: number): BehaviorSubject<PaymentOption[]> {
    if (!this.paymentOptionsMap.has(usuarioId)) {
      this.paymentOptionsMap.set(usuarioId, new BehaviorSubject<PaymentOption[]>([]));
    }
    return this.paymentOptionsMap.get(usuarioId)!;
  }

  getPaymentOptionById(id: number): Observable<PaymentOption> {
    return this.http.get<PaymentOption>(`${this.apiUrl}/${id}`);
  }

  savePaymentOption(paymentOption: PaymentOption): Observable<PaymentOption> {
    const url = paymentOption.id ? `${this.apiUrl}/${paymentOption.id}` : this.apiUrl;
    return (paymentOption.id ? this.http.put<PaymentOption>(url, paymentOption) : this.http.post<PaymentOption>(url, paymentOption)).pipe(
      tap(() => {
        const currentUserId = paymentOption.usuarioId || 0;
        this.refreshPaymentsSubject.next(currentUserId); // Notifica el cambio
        this.getPaymentOptionsByUsuarioId(currentUserId).subscribe(data =>
          this.getPaymentOptionsSubject(currentUserId).next(data)
        );
      })
    );
  }



  getPaymentOptionsByUsuarioId(usuarioId: number): Observable<PaymentOption[]> {
    console.log(`[Service] Fetching payment options for user ID: ${usuarioId}`);
    return this.http.get<PaymentOption[]>(`${this.apiUrl}/usuario/${usuarioId}`).pipe(
      tap(data => {
        console.log('[Service] Received payment options from backend:', data);
        this.paymentOptionsSubject.next(data);
        this.getPaymentOptionsSubject(usuarioId).next(data);
      })
    );
  }

  deletePaymentOption(id: number): Observable<void> {
    console.log(`[Service] Deleting payment option with ID: ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentUserId = this.authService.getCurrentUser()?.id;
        if (currentUserId) {
          this.refreshPaymentsSubject.next(currentUserId); // Notifica el cambio
          this.getPaymentOptionsByUsuarioId(currentUserId).subscribe(data =>
            this.getPaymentOptionsSubject(currentUserId).next(data)
          );
        }
      })
    );
  }
}
