import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./modules/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./modules/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'stores',
    loadComponent: () => import('./modules/stores/stores.component').then(m => m.StoresComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['super-admin'] }
  },
  {
    path: 'inventory',
    loadComponent: () => import('./modules/inventory/inventory.component').then(m => m.InventoryComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['employee'] }
  },
  {
    path: 'pos',
    loadComponent: () => import('./modules/orders/pos.component').then(m => m.PosComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['employee'] }
  },
  {
    path: 'reports',
    loadComponent: () => import('./modules/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['employee'] }
  },
  {
    path: 'settings',
    loadComponent: () => import('./modules/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'storefront',
    loadComponent: () => import('./modules/storefront/storefront.component').then(m => m.StorefrontComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
