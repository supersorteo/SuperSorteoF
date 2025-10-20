import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { Raffle } from '../interfaces/raffle';
import { environment } from '../../environment/environment';
import { RifaGanadorDTO } from '../interfaces/rifa-ganador-dto';

@Injectable({
  providedIn: 'root'
})
export class RaffleService {

  //private baseUrl = 'http://localhost:8080/api/images';
  private baseUrl = 'https://sweet-laughter-production.up.railway.app/api/images';

  //private apiUrl = 'http://localhost:8080/api/rifas';
  private apiUrl = 'https://sweet-laughter-production.up.railway.app/api/rifas';

  //private VIPUrl ='http://localhost:8080/codigos-vip'

  private VIPUrl ='https://sweet-laughter-production.up.railway.app/codigos-vip';

  private api = 'https://sweet-laughter-production.up.railway.app/usuarios';

  //private api = 'http://localhost:8080/usuarios';

  constructor(private http: HttpClient) { }



  getAllRaffles(): Observable<Raffle[]> {
    return this.http.get<Raffle[]>(this.apiUrl);
  }



  // Obtener rifas por usuario
  getRafflesByUser(userId: number): Observable<Raffle[]> {
    return this.http.get<Raffle[]>(`${this.apiUrl}/usuario/${userId}`);
  }





    crearRifa(rifa: Raffle): Observable<any> {
      const url = this.apiUrl;
      console.log('URL de la petición:', url);
      return this.http.post<any>(url, rifa).pipe(
        catchError((error) => this.handleError(error))
      );
    }


    // Crear rifa con código VIP
    crearRifaConCodigoVip(rifa: Raffle, codigoVip: string): Observable<any> {
      const params = new HttpParams().set('codigoVip', codigoVip);
      const url = `${this.apiUrl}?codigoVip=${codigoVip}`;
      console.log('URL de la petición con código VIP:', url);
      return this.http.post<any>(url, rifa).pipe(
        catchError((error) => this.handleError(error))
      );
    }

    obtenerCodigosVip(): Observable<any[]> {
      return this.http.get<any[]>(this.VIPUrl)
        .pipe(catchError(this.handleError));
    }


  activarVip(userId: number, codigoVip: string): Observable<any> {
  const url = `${this.api}/${userId}/activar-vip`; // 🔥 Usamos la propiedad `api`
  return this.http.put<any>(url, { codigoVip }).pipe(
    catchError((error) => this.handleError(error))
  );
}


obtenerUsuarioPorId(userId: number): Observable<any> {
  const url = `${this.api}/${userId}`;
  return this.http.get<any>(url).pipe(
    catchError((error) => this.handleError(error))
  );
}



  updateRaffle(id: number, raffle: Raffle): Observable<Raffle> {
    return this.http.put<Raffle>(`${this.apiUrl}/${id}`, raffle, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  generarImagenRifa(rifaId: number): Observable<string> {
    const url = `${this.baseUrl}/generar/${rifaId}`; // Asegúrate de que el backend tenga este endpoint
    return this.http.get<{ url: string }>(url).pipe(
      map(response => response.url),
      catchError((error) => {
        console.error('Error al generar la imagen:', error);
        return throwError(() => new Error('Error al generar la imagen de la rifa'));
      })
    );
  }




  // Método para eliminar una rifa
  deleteRaffle(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }





  deleteImage(fileName: string): Observable<void> {

     // const url = `https://sweet-laughter-production.up.railway.app/api/images/${fileName}`;
      const url = `${this.baseUrl}/${fileName}`
    return this.http.delete<void>(url);
  }



  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  uploadImages(files: File[]): Observable<string[]> {

    const formData = new FormData();
     files.forEach((file) => {
    formData.append('files', file, file.name); // 'files' debe coincidir con el nombre en el backend
   });

   return this.http.post<{ urls: string[] }>(`${this.baseUrl}/upload`, formData).pipe(
  map(response => response.urls),
  catchError((error) => {
    console.error('Error en la carga de imágenes:', error);
    return throwError(() => new Error('Error al subir las imágenes'));
  })
);

  }


obtenerRifasPorUsuarioId(usuarioId: number): Observable<Raffle[]> {
  return this.http.get<Raffle[]>(`${this.apiUrl}/usuario/${usuarioId}`).pipe(
    catchError((error) => {
      console.error('❌ Error al obtener rifas del usuario:', error);
      return throwError(() => new Error('Error al obtener rifas del usuario.'));
    })
  );
}




  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error inesperado. Inténtalo de nuevo.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else if (error.status === 400 || error.status === 409) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('Error en el servicio:', errorMessage);
    return throwError(() => errorMessage); // Lanzamos solo el mensaje de error, no un objeto Error
  }





  obtenerRifaPorId(id: number): Observable<Raffle> {
  return this.http.get<Raffle>(`${this.apiUrl}/${id}`).pipe(
    tap(response => console.log("📌 Rifa obtenida:", response)),
    catchError((error) => this.handleError(error))
  );
}

obtenerRifaPorId1(id: number): Observable<RifaGanadorDTO> {
  return this.http.get<RifaGanadorDTO>(`${this.apiUrl}/${id}`).pipe(
    tap(response => console.log("📌 Rifa obtenida con participantes:", response)),
    catchError((error) => this.handleError(error))
  );
}





getRaffleById(id: number): Observable<RifaGanadorDTO | Raffle> {
  return this.http.get<RifaGanadorDTO | Raffle>(`${this.apiUrl}/${id}`);
}

executeRaffle(id: number): Observable<RifaGanadorDTO | Raffle> {
  return this.http.put<RifaGanadorDTO | Raffle>(`${this.apiUrl}/execute/${id}`, null);
}

getAllWinners(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/winners`).pipe(
    catchError((error) => {
      console.error('❌ Error al obtener ganadores:', error);
      return throwError(() => new Error('Error al obtener ganadores.'));
    })
  );
}

getWinnerByRaffleId(rifaId: number): Observable<RifaGanadorDTO> {
  return this.http.get<RifaGanadorDTO>(`${this.apiUrl}/winners/${rifaId}`).pipe(
    catchError((error) => {
      console.error('❌ Error al obtener ganador de la rifa:', error);
      return throwError(() => new Error('Error al obtener ganador de la rifa.'));
    })
  );
}



}
