import { HostBinding, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StylesService {
  currentTheme: 'light-theme' | 'dark-theme' = 'light-theme';
  isDark: boolean = false;

  onThemeChanged() {
    this.isDark=!this.isDark;
    document.body.classList.remove(this.currentTheme);
    this.currentTheme = this.isDark ? 'dark-theme' : 'light-theme';
    document.body.classList.add(this.currentTheme);
  }
}
