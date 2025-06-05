import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { AuthenticationService } from '../../services/authentication.service';
import Swal from 'sweetalert2';
import { SidebarModule } from 'primeng/sidebar';
import { Sidebar } from 'primeng/sidebar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ToolbarModule, ButtonModule, SidebarModule, InputSwitchModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  userName: string = '';
  daysLeft: number = 30;
  title = 'Supersorteo';



  //checked: boolean = true;
  //selectedTheme: string = 'dark';
  checked: boolean = false;
  selectedTheme: string = 'light';
  themeService: ThemeService = inject(ThemeService);
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  isExternal: boolean = false;
  closeCallback(e: Event): void {
      this.sidebarRef.close(e);
  }


  sidebarVisible: boolean = false;
  constructor(private authService: AuthenticationService, private router: Router) {}

  ngOnInit() {
    this.themeService.setTheme(this.selectedTheme);
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.userName = currentUser.name || 'Usuario';

      // Detectar cambios de ruta para actualizar isExternal
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          // Si la URL contiene "external-raffle", establecemos isExternal a true
          this.isExternal = event.url.includes('/external-raffle');
        }
      });

  }

  onThemeChange(theme: string): void {
    this.selectedTheme = theme;
    this.themeService.setTheme(theme);
    this.checked = theme === 'dark';
  }


  logout(): void {
    this.sidebarVisible = false
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Quieres cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'No, permanecer'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/']);
        Swal.fire( '¡Cerrado!', 'Tu sesión ha sido cerrada', 'success' );
      }
    });
  }

}
