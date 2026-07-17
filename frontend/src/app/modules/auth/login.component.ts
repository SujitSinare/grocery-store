import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '../../core/signals/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authStore = inject(AuthStore);
  private router = inject(Router);

  mode: 'password' | 'otp' = 'password';
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  phone = '';
  otp = '';
  otpRequested = false;
  simulatorOtp = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  setMode(mode: 'password' | 'otp') {
    this.mode = mode;
    this.errorMessage = '';
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    this.authStore.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.redirectUser();
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid credentials. Please try again.';
      }
    });
  }

  onRequestOtp() {
    if (!this.phone) return;
    this.loading = true;
    this.errorMessage = '';

    this.authStore.requestOtp(this.phone).subscribe({
      next: res => {
        this.loading = false;
        this.otpRequested = true;
        this.simulatorOtp = res.otpSimulatorOnly;
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error requesting OTP code.';
      }
    });
  }

  onVerifyOtp() {
    if (this.otp.length !== 6) return;
    this.loading = true;
    this.errorMessage = '';

    this.authStore.verifyOtp(this.phone, this.otp).subscribe({
      next: () => {
        this.loading = false;
        this.redirectUser();
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid or expired OTP.';
      }
    });
  }

  private redirectUser() {
    const user = this.authStore.currentUser();
    if (user?.role === 'super-admin') {
      this.router.navigate(['/stores']);
    } else if (user?.role === 'employee') {
      // Set default store for testing
      this.authStore.setStoreId('660000000000000000000001'); // Mock store ID that seeds generate
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/storefront']);
    }
  }
}
