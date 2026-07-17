import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  registerForm: FormGroup;
  loading = false;

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onRegister() {
    if (this.registerForm.invalid) return;
    this.loading = true;

    // Simulate customer profile creation (links to Users creation in backend)
    // Register details endpoint
    this.http.post('customers', this.registerForm.value, {
      headers: { 'x-store-id': '660000000000000000000001' } // Default test store context
    }).subscribe({
      next: () => {
        this.loading = false;
        alert('Account created successfully! Please login.');
        this.router.navigate(['/auth/login']);
      },
      error: err => {
        this.loading = false;
        alert(err.error?.message || 'Error creating account');
      }
    });
  }
}
export { RegisterComponent };
