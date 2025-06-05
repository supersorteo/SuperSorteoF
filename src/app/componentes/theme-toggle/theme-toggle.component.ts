import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Sidebar, SidebarModule } from 'primeng/sidebar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, ButtonModule, SidebarModule, InputSwitchModule, FormsModule],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss'

})
export class ThemeToggleComponent implements OnInit{

   userName: string = '';
   daysLeft: number = 30;
   title = 'Supersorteo';
   checked: boolean = false;
   selectedTheme: string = 'light';
   themeService: ThemeService = inject(ThemeService);
   @ViewChild('sidebarRef') sidebarRef!: Sidebar;
   isExternal: boolean = false;
   closeCallback(e: Event): void {
       this.sidebarRef.close(e);
   }


   constructor(private router: Router){

   }

   ngOnInit(): void {
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

  toggleTheme() {
    this.checked = !this.checked;
    this.onThemeChange(this.checked ? 'dark' : 'light');
  }

  onThemeChange(theme: string): void {
    this.selectedTheme = theme;
    this.themeService.setTheme(theme);
    this.checked = theme === 'dark';
  }

}
