import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CartStore } from '../../core/signals/cart.store';

interface ProductCard {
  _id: string;
  name: string;
  sku: string;
  barcode: string;
  sellingPrice: number;
  mrp: number;
  gstRate: number;
  categoryId: { name: string };
  brandId: { name: string };
  image?: string;
}

@Component({
  selector: 'app-storefront',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './storefront.component.html'
})
export class StorefrontComponent implements OnInit {
  cartStore = inject(CartStore);
  private http = inject(HttpClient);

  products = signal<ProductCard[]>([]);
  searchQuery = '';
  checkoutLoading = false;

  showUpiOverlay = signal<boolean>(false);
  activePayment = signal<any | null>(null);

  ngOnInit() {
    this.loadStorefrontProducts();
  }

  loadStorefrontProducts() {
    // Customers search/query the general products catalogue
    let url = 'products';
    if (this.searchQuery) {
      url += `?search=${this.searchQuery}`;
    }

    this.http.get<{ products: ProductCard[] }>(url).subscribe({
      next: res => {
        // Map default pricing since it's global products list
        const cards = res.products.map(p => ({
          ...p,
          sellingPrice: p.sku === 'AAS5KG' ? 240 : p.sku === 'TSALT1K' ? 20 : 60, // Fallback dummy prices
          mrp: p.sku === 'AAS5KG' ? 250 : p.sku === 'TSALT1K' ? 20 : 60,
          gstRate: p.sku === 'BMARIE250' ? 18 : 5
        }));
        this.products.set(cards);
      }
    });
  }

  onSearch() {
    this.loadStorefrontProducts();
  }

  addToBasket(prod: ProductCard) {
    this.cartStore.addItem({
      productId: prod._id,
      name: prod.name,
      sku: prod.sku,
      barcode: prod.barcode,
      price: prod.sellingPrice,
      mrp: prod.mrp,
      gstRate: prod.gstRate
    });
  }

  checkout() {
    this.checkoutLoading = true;
    const body = {
      orderType: 'online',
      paymentMethod: 'upi',
      items: this.cartStore.cartItems().map(i => ({
        productId: i.productId,
        qty: i.qty
      }))
    };

    // Place order under default test store
    this.http.post<any>('orders', body, {
      headers: { 'x-store-id': '660000000000000000000001' }
    }).subscribe({
      next: order => {
        this.checkoutLoading = false;
        // Request dynamic UPI QR
        this.http.post<any>('payments/upi-qr', { orderId: order._id }, {
          headers: { 'x-store-id': '660000000000000000000001' }
        }).subscribe({
          next: pay => {
            this.activePayment.set(pay);
            this.showUpiOverlay.set(true);
          }
        });
      },
      error: () => {
        this.checkoutLoading = false;
        alert('Error placing customer storefront order.');
      }
    });
  }

  confirmUpiPayment() {
    const pay = this.activePayment();
    if (!pay) return;

    this.http.post(`payments/${pay._id}/verify`, { reference: 'ONLINE-' + Date.now() }).subscribe({
      next: () => {
        this.showUpiOverlay.set(false);
        this.cartStore.clear();
        alert('Order placed and paid successfully!');

        // Open PDF invoice
        this.http.get<any>(`invoices/order/${pay.orderId}`).subscribe({
          next: inv => {
            if (inv && inv.pdfUrl) {
              window.open(`http://localhost:3000${inv.pdfUrl}`, '_blank');
            }
          }
        });
      }
    });
  }

  closeUpiOverlay() {
    this.showUpiOverlay.set(false);
    this.cartStore.clear();
  }
}
