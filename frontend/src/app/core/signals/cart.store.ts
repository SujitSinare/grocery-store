import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  qty: number;
  price: number; // selling price
  mrp: number;
  gstRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartStore {
  // Reactive cart list signal
  cartItems = signal<CartItem[]>([]);

  // Computed properties
  itemsCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.qty, 0));
  
  subTotal = computed(() => 
    this.cartItems().reduce((acc, item) => acc + (item.price * item.qty), 0)
  );

  taxTotal = computed(() => 
    this.cartItems().reduce((acc, item) => acc + ((item.price * item.qty * item.gstRate) / 100), 0)
  );

  grandTotal = computed(() => Math.round((this.subTotal() + this.taxTotal()) * 100) / 100);

  addItem(item: Omit<CartItem, 'qty'>, qty: number = 1): void {
    const items = this.cartItems();
    const existing = items.find(i => i.productId === item.productId);

    if (existing) {
      this.updateQty(item.productId, existing.qty + qty);
    } else {
      this.cartItems.set([...items, { ...item, qty }]);
    }
  }

  removeItem(productId: string): void {
    this.cartItems.set(this.cartItems().filter(i => i.productId !== productId));
  }

  updateQty(productId: string, qty: number): void {
    if (qty <= 0) {
      this.removeItem(productId);
      return;
    }
    this.cartItems.set(
      this.cartItems().map(i => i.productId === productId ? { ...i, qty } : i)
    );
  }

  clear(): void {
    this.cartItems.set([]);
  }
}
