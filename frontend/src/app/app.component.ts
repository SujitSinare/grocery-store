import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthStore } from './core/signals/auth.store';
import { ThemeStore } from './core/signals/theme.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslateModule
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  authStore = inject(AuthStore);
  themeStore = inject(ThemeStore);
  private translate = inject(TranslateService);

  activeLang = 'en';

  constructor() {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  setLang(lang: string): void {
    this.activeLang = lang;
    this.translate.use(lang);
  }

  logout(): void {
    this.authStore.logout();
  }
}
