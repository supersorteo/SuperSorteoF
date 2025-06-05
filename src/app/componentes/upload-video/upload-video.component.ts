import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { VideoService } from '../../services/video.service';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-upload-video',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule, ConfirmDialogModule],
  templateUrl: './upload-video.component.html',
  styleUrl: './upload-video.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class UploadVideoComponent implements OnInit{
  selectedFile!: any;
  videoUrl!: any;
  uploadMessage?: string;
  uploadedVideos: string[] = [];
  videoPreviewUrl?: string;
  videos: string[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private videoService: VideoService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ){}

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.videoService.getVideos().subscribe({
      next: (response: string[]) => {
        this.videos = response;
        console.log('Videos cargados:', this.videos);
      },
      error: (error) => {
        console.error('Error al cargar videos:', error);
      }
    });
  }

  // Construye la URL completa para acceder al video
  getVideoUrl(videoName: string): string {
    return this.videoService.getVideoUrl(videoName);
  }



  // Determina el Content-Type según la extensión del archivo
  getVideoType(videoName: string): string {
    const ext = videoName.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'mp4': return 'video/mp4';
      case 'webm': return 'video/webm';
      case 'ogg': return 'video/ogg';
      case 'mkv': return 'video/x-matroska';
      case 'avi': return 'video/x-msvideo';
      case 'mpg': return 'video/mpeg';
      default: return 'video/mp4';
    }
  }



  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.videoPreviewUrl = URL.createObjectURL(this.selectedFile);
      console.log('Archivo seleccionado:', this.selectedFile.name);
    }
  }




  uploadVideo1(fileInput: HTMLInputElement): void {
    if (!this.selectedFile) {
      this.uploadMessage = 'Por favor, seleccione un archivo.';
      return;
    }
    this.videoService.uploadVideo(this.selectedFile).subscribe({
      next: (response: string) => {
        this.uploadMessage = response;
        // Construir la URL del video subido y agregarla al arreglo
        const url = this.videoService.getVideoUrl(this.selectedFile.name);
        this.uploadedVideos.push(url);
        // Limpiar el input file y la variable seleccionada
        this.selectedFile = undefined;
        this.videoPreviewUrl = undefined;
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
      },
      error: (error) => {
        console.error('Error al subir el video:', error);
        this.uploadMessage = error.message || 'Error al subir el video.';
      }
    });
  }


  uploadVideo0(fileInput: HTMLInputElement): void {
    if (!this.selectedFile) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, seleccione un archivo.' });
      return;
    }
    this.videoService.uploadVideo(this.selectedFile).subscribe({
      next: (response: string) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: response });
        // Construir la URL del video subido y agregarla al arreglo
        const url = this.videoService.getVideoUrl(this.selectedFile.name);
        this.uploadedVideos.push(url);
        // Limpiar el input file y la previsualización
        this.clearSelectedVideo();
      },
      error: (error) => {
        console.error('Error al subir el video:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Error al subir el video.' });
      }
    });
  }

  uploadVideo(): void {
    if (!this.selectedFile) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, seleccione un archivo.' });
      return;
    }

    this.videoService.uploadVideo(this.selectedFile).subscribe({
      next: (response: string) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: response });
        this.loadVideos(); // Refrescar la lista de videos
        this.clearSelectedVideo(); // Limpiar previsualización
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Error al subir el video.' });
      }
    });
  }







  deleteSelectedVideo(): void {
    // Elimina la previsualización antes de subir el video
    this.clearSelectedVideo();
    this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Video descartado.' });
  }


  deleteVideo1(videoName: string): void {
    this.videoService.deleteVideo(videoName).subscribe({
      next: (response: string) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: response });
        // Recargar la lista de videos luego de eliminar uno
        this.loadVideos();
      },
      error: (error) => {
        console.error('Error al eliminar el video:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Error al eliminar el video.' });
      }
    });
  }


  deleteVideo(videoName: string): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar el video "${videoName}"?`,
      header: 'Confirmación de eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.videoService.deleteVideo(videoName).subscribe({
          next: (response: string) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: response
            });
            // Recargar la lista de videos luego de la eliminación
            this.loadVideos();
          },
          error: (error) => {
            console.error('Error al eliminar el video:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Error al eliminar el video.'
            });
          }
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'La eliminación ha sido cancelada.'
        });
      }
    });
  }



  private clearSelectedVideo(): void {
    this.videoPreviewUrl = undefined;
    this.selectedFile = undefined;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }



  goHome(){
    this.router.navigate(['home'])
  }

}
