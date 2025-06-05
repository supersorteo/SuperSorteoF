import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import { Raffle } from '../../interfaces/raffle';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-raffle-banner',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule],
  templateUrl: './raffle-banner.component.html',
  styleUrl: './raffle-banner.component.scss'
})
export class RaffleBannerComponent  implements AfterViewInit{

  @Input() raffle!: any;

 // @ViewChild('banner') banner!: ElementRef;
  @ViewChild('banner', { static: false }) banner!: ElementRef;
  // La imagen generada (dataURL) se puede usar para mostrar una vista previa o descargarla

  imageDataUrl: string | null = null;
  displayModal: boolean = false;
  safeDescription!: SafeHtml;

  constructor(private sanitizer: DomSanitizer) { }

  ngAfterViewInit(): void {
    setTimeout(() => this.captureBanner(), 2000);
    this.loadDescription();
  }

  captureBanner(): void {
    html2canvas(this.banner.nativeElement, {
      allowTaint: true,
      useCORS: true
    })
    .then(canvas => {
      this.imageDataUrl = canvas.toDataURL('image/png');
      console.log('Banner capturado:', this.imageDataUrl);
    })
    .catch(error => {
      console.error('Error capturando el banner:', error);
    });
  }


  openBanner(): void {
    this.displayModal = true;

    setTimeout(() => {
      if (this.banner) {
        this.captureBanner();
      }
    }, 500);
  }

  // Método para capturar la imagen del banner


  loadDescription(): void {
    if (this.raffle && this.raffle.producto && this.raffle.producto.descripcion) {
      // Usa bypassSecurityTrustHtml para marcar el contenido como seguro
      this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(this.raffle.producto.descripcion);
      console.log('Descripcion cagada', this.safeDescription)
    }
  }


getCornerClass0(index: number): string {
  switch (index) {
    case 0:
      return 'top-right';
    case 1:
      return 'top-left';
    case 2:
      return 'bottom-left';
    case 3:
      return 'bottom-right';
    default:
      return '';
  }
}

getCornerClass(index: number): string {
  switch (index) {
    case 0:
      return 'image-pos-1';
    case 1:
      return 'image-pos-2';
    case 2:
      return 'image-pos-3';
    case 3:
      return 'image-pos-4';
    case 4:
      return 'image-pos-5';
    default:
      return ''; // Para índices adicionales se puede retornar una posición por defecto
  }
}




  downloadImage(): void {
    if (!this.imageDataUrl) {
      console.error('No hay imagen disponible para descargar');
      return;
    }

    const link = document.createElement('a');
    link.href = this.imageDataUrl;
    link.download = 'raffle-banner.png';
    link.click();
  }



}
