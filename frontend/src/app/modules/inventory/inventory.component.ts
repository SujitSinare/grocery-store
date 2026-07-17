import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

interface InventoryItem {
  _id: string;
  productId: {
    name: string;
    sku: string;
    barcode: string;
    image?: string;
  };
  currentStock: number;
  minStock: number;
  maxStock: number;
  sellingPrice: number;
  mrp: number;
  batchNumber?: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './inventory.component.html'
})
export class InventoryComponent implements OnInit {
  private http = inject(HttpClient);

  inventory = signal<InventoryItem[]>([]);
  lowStockOnly = signal<boolean>(false);
  searchQuery = '';

  selectedItem = signal<InventoryItem | null>(null);
  adjustQty = 0;
  adjustReason = '';

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    let url = 'inventory';
    const params: string[] = [];

    if (this.lowStockOnly()) {
      params.push('lowStockOnly=true');
    }
    if (this.searchQuery) {
      params.push(`search=${this.searchQuery}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    this.http.get<{ items: InventoryItem[] }>(url).subscribe({
      next: res => this.inventory.set(res.items)
    });
  }

  toggleLowStockOnly() {
    this.lowStockOnly.update(val => !val);
    this.loadInventory();
  }

  onSearch() {
    this.loadInventory();
  }

  openAdjustment(item: InventoryItem) {
    this.selectedItem.set(item);
    this.adjustQty = 0;
    this.adjustReason = '';
  }

  closeAdjustment() {
    this.selectedItem.set(null);
  }

  submitAdjustment() {
    const item = this.selectedItem();
    if (!item) return;

    this.http.patch(`inventory/${item._id}/adjust`, {
      qty: this.adjustQty,
      reason: this.adjustReason
    }).subscribe({
      next: () => {
        this.closeAdjustment();
        this.loadInventory();
      }
    });
  }
}
