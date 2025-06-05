import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
    ReactiveFormsModule],
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


  tabs = [
    { title: '¿Pregunta 1?', content: 'Respuesta para la pregunta 1' },
    { title: '¿Pregunta 2?', content: 'Respuesta para la pregunta 2' },
    { title: '¿Pregunta 3?', content: 'Respuesta para la pregunta 3' }
];

  constructor(private router: Router, private themeService: ThemeService, private videoService: VideoService){

  }
  ngOnInit(): void {


    this.products = [
      { name: 'Imagen 1', image: 'assets/descarga.jpeg' },
      { name: 'Imagen 2', image: 'assets/casa.jpeg' }
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

}
