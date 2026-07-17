import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Store {
  _id: string;
  name: string;
  gstNumber: string;
  address: string;
  phone: string;
  isActive: boolean;
  managerId?: { name: string; email: string };
}

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './stores.component.html'
})
export class StoresComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  stores = signal<Store[]>([]);
  showForm = signal<boolean>(false);
  storeForm: FormGroup;
  loading = false;

  constructor() {
    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      gstNumber: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadStores();
  }

  loadStores() {
    this.http.get<Store[]>('stores').subscribe({
      next: data => this.stores.set(data)
    });
  }

  onCreateStore() {
    if (this.storeForm.invalid) return;
    this.loading = true;

    this.http.post<Store>('stores', this.storeForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.showForm.set(false);
        this.storeForm.reset();
        this.loadStores();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleStoreStatus(store: Store) {
    this.http.patch(`stores/${store._id}/status`, { isActive: !store.isActive }).subscribe({
      next: () => this.loadStores()
    });
  }
}
export { StoresComponent };
