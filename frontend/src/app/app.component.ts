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
  template: `
    <div [class.dark]="themeStore.theme() === 'dark'" class="min-h-screen bg-gray-50 dark:bg-dark-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      
      <!-- Top Navigation Header -->
      <header class="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 py-4 shadow-sm border-b border-gray-200/50 dark:border-gray-800/50">
        <div class="flex items-center gap-3">
          <span class="material-icons text-green-500 text-3xl">shopping_basket</span>
          <h1 class="text-xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            Smart Grocery Store
          </h1>
        </div>

        <div class="flex items-center gap-4">
          <!-- Language Selector -->
          <div class="flex items-center gap-1 border border-gray-200 dark:border-gray-800 rounded-lg p-1 bg-white dark:bg-gray-800/80">
            <button (click)="setLang('en')" [class.bg-green-500]="activeLang === 'en'" [class.text-white]="activeLang === 'en'" class="px-3 py-1 rounded text-xs font-semibold uppercase transition-all duration-150">EN</button>
            <button (click)="setLang('mr')" [class.bg-green-500]="activeLang === 'mr'" [class.text-white]="activeLang === 'mr'" class="px-3 py-1 rounded text-xs font-semibold uppercase transition-all duration-150">मराठी</button>
          </div>

          <!-- Theme Toggle -->
          <button (click)="themeStore.toggleTheme()" class="p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <span class="material-icons text-gray-600 dark:text-yellow-400">
              {{ themeStore.theme() === 'light' ? 'dark_mode' : 'light_mode' }}
            </span>
          </button>

          <!-- User Details / Logout -->
          @if (authStore.isAuthenticated()) {
            <div class="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-semibold">{{ authStore.currentUser()?.email }}</p>
                <p class="text-xs text-gray-500 capitalize">{{ authStore.currentUser()?.role }}</p>
              </div>
              <button (click)="logout()" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors duration-200">
                <span class="material-icons">logout</span>
              </button>
            </div>
          }
        </div>
      </header>

      <div class="flex">
        <!-- Sidebar Navigation (Only visible when authenticated) -->
        @if (authStore.isAuthenticated()) {
          <aside class="w-64 glass-panel border-r border-gray-200/50 dark:border-gray-800/50 min-h-[calc(100vh-73px)] p-4 flex flex-col justify-between">
            <div class="space-y-2">
              
              <!-- Super Admin Actions -->
              @if (authStore.isSuperAdmin()) {
                <a routerLink="/dashboard" routerLinkActive="bg-green-500 text-white shadow-md shadow-green-500/20" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
                  <span class="material-icons">dashboard</span>
                  <span>{{ 'COMMON.DASHBOARD' | translate }}</span>
                </a>
                <a routerLink="/stores" routerLinkActive="bg-green-500 text-white shadow-md" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
                  <span class="material-icons">storefront</span>
                  <span>{{ 'COMMON.STORES' | translate }}</span>
                </a>
              }

              <!-- Manager / Worker Actions -->
              @if (authStore.isEmployee()) {
                <a routerLink="/dashboard" routerLinkActive="bg-green-500 text-white shadow-md shadow-green-500/20" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
                  <span class="material-icons">dashboard</span>
                  <span>{{ 'COMMON.DASHBOARD' | translate }}</span>
                </a>
                <a routerLink="/pos" routerLinkActive="bg-green-500 text-white shadow-md" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
                  <span class="material-icons">point_of_sale</span>
                  <span>POS Terminal</span>
                </a>
                <a routerLink="/inventory" routerLinkActive="bg-green-500 text-white shadow-md" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
                  <span class="material-icons">inventory_2</span>
                  <span>{{ 'COMMON.INVENTORY' | translate }}</span>
                </a>
                <a routerLink="/reports" routerLinkActive="bg-green-500 text-white shadow-md" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
                  <span class="material-icons">bar_chart</span>
                  <span>{{ 'COMMON.REPORTS' | translate }}</span>
                </a>
              }

              <!-- Customer Actions -->
              @if (authStore.isCustomer()) {
                <a routerLink="/storefront" routerLinkActive="bg-green-500 text-white shadow-md" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
                  <span class="material-icons">local_mall</span>
                  <span>Shop Online</span>
                </a>
              }

              <a routerLink="/settings" routerLinkActive="bg-green-500 text-white shadow-md" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
                <span class="material-icons">settings</span>
                <span>{{ 'COMMON.SETTINGS' | translate }}</span>
              </a>

            </div>

            <!-- Footer indicator -->
            <div class="p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl text-xs text-gray-500 dark:text-gray-400 text-center">
              Multi-Store SaaS v1.0
            </div>
          </aside>
        }

        <!-- Main Content Area -->
        <main class="flex-1 p-8">
          <router-outlet></router-outlet>
        </main>
      </div>

    </div>
  `,
  styles: []
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
export { AppComponent };
