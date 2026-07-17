import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeStore {
  // Theme Signal: Default to localStorage value or 'light'
  theme = signal<string>(localStorage.getItem('theme') || 'light');

  constructor() {
    // Reactively watch for theme changes and update HTML class bindings
    effect(() => {
      const currentTheme = this.theme();
      localStorage.setItem('theme', currentTheme);
      
      const root = document.documentElement;
      if (currentTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    });
  }

  toggleTheme(): void {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.theme.set(theme);
  }
}
export { ThemeStore };
