import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./componentes/navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from "./componentes/theme-toggle/theme-toggle.component";
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from './services/theme.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, InputSwitchModule, FormsModule, ButtonModule, ThemeToggleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Supersorteo';
  shouldShowToolbar: boolean = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {

      if (event instanceof NavigationEnd) {

        const currentUrl = this.router.url;
        this.shouldShowToolbar = !(currentUrl === '/login' ||
          currentUrl.startsWith('/codigos') ||
          currentUrl.startsWith('/datos-rifa') ||
          currentUrl.startsWith('/home')
        );

      }
    });
  }

}
