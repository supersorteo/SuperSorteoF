import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  //activeTheme: string = 'dark';
  activeTheme: string = 'light';
  getTheme() {
    return this.activeTheme;
  }


  setTheme1(theme: string): void {
    let themeLink = document.getElementById('app-theme') as HTMLLinkElement;

    if (themeLink) {
      themeLink.href = theme + '.css';
    }
    this.activeTheme = theme;
  }

  setTheme(theme: string): void {
    const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    console.log('Cambiando tema a:', theme);
    if (themeLink) {

      themeLink.href = theme + '.css';
      console.log('Nuevo href asignado:', themeLink.href);
    } else {
      console.error('No se encontró el link con id "app-theme"');
    }
    this.activeTheme = theme;
  }


}
