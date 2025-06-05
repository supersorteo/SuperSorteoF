import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  private apiUrl = 'http://localhost:8080/api/videos/';
  //private apiUrl = 'https://pruebaback-5.onrender.com/api/videos/';
  constructor(private http: HttpClient) { }






uploadVideo(file: File): Observable<string> {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post(`${this.apiUrl}upload`, formData, { responseType: 'text' }).pipe(
    catchError((error) => {
      if (error.status === 409) {
        return throwError(() => new Error('Este video ya está en la base de datos.'));
      }
      return throwError(() => new Error('Error al subir el video.'));
    })
  );
}


// Retorna la lista de nombres de videos almacenados
getVideos(): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}list`);
}

// Construye la URL para acceder a un video específico
getVideoUrl(videoName: string): string {
  return `${this.apiUrl}${videoName}`;
}


deleteVideo(videoName: string): Observable<string> {
  return this.http.delete(`${this.apiUrl}${videoName}`, { responseType: 'text' }).pipe(
    catchError((error) => {
      console.error('Error al eliminar el video:', error);
      return throwError(() => new Error('Error al eliminar el video.'));
    })
  );
}





}
