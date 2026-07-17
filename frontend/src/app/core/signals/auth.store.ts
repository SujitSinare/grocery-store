import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

interface UserProfile {
  id: string;
  email: string;
  phone: string;
  role: 'super-admin' | 'customer' | 'employee';
}

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  // Reactive State Signals
  currentUser = signal<UserProfile | null>(null);
  accessToken = signal<string | null>(localStorage.getItem('access_token'));
  storeId = signal<string | null>(localStorage.getItem('selected_store_id'));

  // Computed states
  isAuthenticated = computed(() => !!this.accessToken());
  isSuperAdmin = computed(() => this.currentUser()?.role === 'super-admin');
  isCustomer = computed(() => this.currentUser()?.role === 'customer');
  isEmployee = computed(() => this.currentUser()?.role === 'employee');

  constructor(private http: HttpClient, private router: Router) {
    // Attempt profile restore if token is available
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      try {
        this.currentUser.set(JSON.parse(savedProfile));
      } catch (e) {
        this.logout();
      }
    }
  }

  login(credentials: { email: string; password?: string }): Observable<any> {
    return this.http.post<any>('auth/login', credentials).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  requestOtp(phone: string): Observable<any> {
    return this.http.post<any>('auth/otp/request', { phone });
  }

  verifyOtp(phone: string, otp: string): Observable<any> {
    return this.http.post<any>('auth/otp/verify', { phone, otp }).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  setStoreId(id: string | null): void {
    this.storeId.set(id);
    if (id) {
      localStorage.setItem('selected_store_id', id);
    } else {
      localStorage.removeItem('selected_store_id');
    }
  }

  logout(): void {
    this.currentUser.set(null);
    this.accessToken.set(null);
    this.storeId.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('selected_store_id');
    this.router.navigate(['/auth/login']);
  }

  private handleAuthResponse(res: any): void {
    if (res && res.accessToken) {
      this.accessToken.set(res.accessToken);
      this.currentUser.set(res.user);
      localStorage.setItem('access_token', res.accessToken);
      localStorage.setItem('refresh_token', res.refreshToken);
      localStorage.setItem('user_profile', JSON.stringify(res.user));
    }
  }
}
export { UserProfile };
