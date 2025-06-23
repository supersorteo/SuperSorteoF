import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TabMenuModule } from 'primeng/tabmenu';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MenubarModule } from 'primeng/menubar';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ThemeService } from '../../services/theme.service';
import { CarouselModule } from 'primeng/carousel';
import { VideoService } from '../../services/video.service';
import { AccordionModule } from 'primeng/accordion';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

declare var html2pdf: any;


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TabMenuModule,ToolbarModule, CarouselModule, AccordionModule,
    MenubarModule,
    DialogModule,
    TabViewModule,
    InputTextModule,
    ButtonModule,
    AvatarModule,
    CardModule,
    ReactiveFormsModule,
    ProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent  implements OnInit{
  menuVisible = false;
  currentTheme: string = 'light';
  products: any[] = [];
  videoUrl: string = '';
  videos: string[] = [];
  responsiveOptions: any[] | undefined;
  visible: boolean = false;


  mostrarOcultarMenu(): void {
    this.menuVisible = !this.menuVisible;
    console.log('menuVisible:', this.menuVisible);
  }

  seleccionar(): void {
    this.menuVisible = false;
  }
  items: any[] | undefined;
  displayModal: boolean = false;

 visibleTerminos:boolean = false;
  @ViewChild('contenidoTexto') contenidoTextoRef!: ElementRef;
  tabs = [
    { title: '¿Cuántos sorteos gratuitos puedo crear al mes?', content: 'Con nuestro plan gratuito, dispones de la oportunidad de crear un sorteo al mes sin costo alguno. Al finalizar el mes, el contador de sorteos se reinicia.' },
    { title: '¿Cómo funciona Supersorteo?', content: 'En SUPERSORTEO, puedes crear una rifa online de un producto o servicio de forma sencilla. Solo necesitas establecer una fecha límite y un valor por número. Automáticamente, se generará una página web exclusiva para tu rifa, la cual podrás compartir fácilmente a través de redes sociales o WhatsApp, alcanzando así a miles de usuarios en todo el país.' },
    { title: '¿Cómo se reservan los números?', content: 'Cada sorteo que crees genera un código único de reserva. Luego de que los usuarios abonen en valor de un código, tenés que compartir tu código de reserva.' },
     { title:'¿Cómo cobro a los participantes', content: 'En menú/opciones de pago, seleccioná el tipo e billetera virtual  y agregá el alias o CBU/CVU. Las opciones de cobro que aceptes tambien estarán disponible en la pagina de la rifa para facilidad de lo participantes.' }
];
isReady = false;


  constructor(private router: Router, private themeService: ThemeService, private videoService: VideoService){

  }
  ngOnInit(): void {


    this.products = [
      { name: 'Imagen 1', image: 'assets/home1.jpg' },
      { name: 'Imagen 2', image: 'assets/home2.jpg' }
  ];


    this.responsiveOptions = [
      {
          breakpoint: '1199px',
          numVisible: 1,
          numScroll: 1
      },
      {
          breakpoint: '991px',
          numVisible: 1,
          numScroll: 1
      },
      {
          breakpoint: '767px',
          numVisible: 1,
          numScroll: 1
      }
  ];

  this.loadVideos()

  }


  loadVideos() {
    this.videoService.getVideos().subscribe(response => {
      this.videos = response; // Lista de nombres de videos
    });
  }

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
      default: return 'video/mp4'; // Fallback
    }
  }


  openModal() {
    this.displayModal = true;
  }


  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  showDialog() {
    this.visible = true;
}

 abrirTerminosLegales(): void {
    this.visibleTerminos = true;
  }





descargarPDF(): void {
  const contenido = document.getElementById('terminos-legales');
  const logo = document.querySelector('.logo-dialog-img') as HTMLImageElement;

  if (!contenido || !logo) return;

  if (!logo.complete) {
    logo.onload = () => this.descargarPDF(); // vuelve a intentar cuando cargue
    return;
  }

  const opciones = {
    margin: 10,
    filename: 'terminos-condiciones.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
  scale: 2,
  useCORS: true,
  scrollY: 0
},

    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opciones).from(contenido).save();
}




descargarWord(): void {
  const contenido = this.contenidoTextoRef?.nativeElement?.innerHTML || '';
  const htmlWord = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Términos</title></head>
    <body>${contenido}</body></html>`;

  const blob = new Blob(['\uFEFF' + htmlWord], { type: 'application/msword' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = 'terminos-legales.doc';
  enlace.click();
}

onDialogShow(): void {
  this.isReady = false;

  // Esperar a que el contenido (texto e imagen) esté renderizado
  const logo = document.querySelector('.logo-dialog-img') as HTMLImageElement;

  if (!logo || logo.complete) {
    setTimeout(() => this.isReady = true, 100); // asegúrate de que todo esté listo
  } else {
    logo.onload = () => {
      this.isReady = true;
    };
  }
}

onDialogHide(): void {
  this.isReady = false;
}



}
