import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Participante } from '../interfaces/participante';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParticipanteService {
  private apiUrl = 'http://localhost:8080/api/participantes';
  //private apiUrl = 'https://pruebaback-5.onrender.com/api/participantes'

  private participantsSubject = new BehaviorSubject<Participante[]>([]);
  participants$ = this.participantsSubject.asObservable();


  private refreshParticipantsSubject = new BehaviorSubject<number | null>(null);
  refreshParticipants$ = this.refreshParticipantsSubject.asObservable();

  constructor(private http: HttpClient) {
   // this.refreshParticipants();
  }

  getAllParticipantes(): Observable<Participante[]> {
    return this.http.get<Participante[]>(this.apiUrl);
  }



    // Método para obtener participantes de una rifa específica
    getParticipantesByRaffleId(raffleId: number): Observable<Participante[]> {
      return this.http.get<Participante[]>(`${this.apiUrl}/raffle/${raffleId}`);
    }



 // Método POST para crear un nuevo participante
 createParticipante(participante: Participante): Observable<Participante> {
  return this.http.post<Participante>(this.apiUrl, participante);
}





  // Método DELETE para eliminar un participante
  deleteParticipante(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }






    refreshParticipants1(): void {
    this.http.get<Participante[]>(this.apiUrl).subscribe({
      next: all => this.participantsSubject.next(all),
      error: err => console.error('Error refrescando participantes:', err)
    });
  }

    refreshParticipants(raffleId: number): void {
    this.refreshParticipantsSubject.next(raffleId);
  }

}
