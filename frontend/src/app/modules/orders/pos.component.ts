import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CartStore } from '../../core/signals/cart.store';

interface ProductInfo {
  _id: string;
  name: string;
  sku: string;
  barcode: string;
  sellingPrice: number;
  mrp: number;
  gstRate: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './pos.component.html'
})
export class PosComponent implements OnInit {
  cartStore = inject(CartStore);
  private http = inject(HttpClient);

  barcodeQuery = '';
  customerPhone = '';
  customerId = '';
  customerName = signal<string>('');
  couponCode = '';
  paymentMethod = signal<string>('cash');

  checkoutLoading = false;
  catalogProducts = signal<ProductInfo[]>([]);

  // UPI variables
  showUpiOverlay = signal<boolean>(false);
  activePayment = signal<any | null>(null);

  ngOnInit() {
    this.loadCatalog();
  }

  loadCatalog() {
    // Load store's inventory to populate POS picker list
    this.http.get<any>('inventory').subscribe({
      next: res => {
        const prods = res.items.map((item: any) => ({
          _id: item.productId?._id,
          name: item.productId?.name || 'Stock item',
          sku: item.productId?.sku,
          barcode: item.productId?.barcode,
          sellingPrice: item.sellingPrice,
          mrp: item.mrp,
          gstRate: item.gstRate
        }));
        this.catalogProducts.set(prods);
      }
    });
  }

  onBarcodeScan() {
    if (!this.barcodeQuery) return;
    this.http.get<ProductInfo>(`products/barcode/${this.barcodeQuery}`).subscribe({
      next: prod => {
        // Find price metrics in our local catalog
        const match = this.catalogProducts().find(p => p._id === prod._id);
        if (match) {
          this.cartStore.addItem({
            productId: prod._id,
            name: prod.name,
            sku: prod.sku,
            barcode: prod.barcode,
            price: match.sellingPrice,
            mrp: match.mrp,
            gstRate: match.gstRate
          });
        }
        this.barcodeQuery = '';
      },
      error: () => {
        alert('Barcode not found in catalog');
        this.barcodeQuery = '';
      }
    });
  }

  addProductToCart(prod: ProductInfo) {
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

  lookupCustomer() {
    if (!this.customerPhone) return;
    this.http.get<any>(`customers/phone/${this.customerPhone}`).subscribe({
      next: res => {
        this.customerId = res._id;
        this.customerName.set(res.name);
      },
      error: () => {
        alert('Customer phone not registered');
        this.customerPhone = '';
        this.customerId = '';
        this.customerName.set('');
      }
    });
  }

  getGrandTotal(): number {
    const total = this.cartStore.grandTotal();
    if (this.couponCode === 'SAVE10') {
      const discount = this.cartStore.subTotal() * 0.1;
      return Math.round((total - discount) * 100) / 100;
    }
    return total;
  }

  processCheckout() {
    this.checkoutLoading = true;
    const body = {
      customerId: this.customerId || undefined,
      orderType: 'pos',
      paymentMethod: this.paymentMethod(),
      couponCode: this.couponCode || undefined,
      items: this.cartStore.cartItems().map(i => ({
        productId: i.productId,
        qty: i.qty
      }))
    };

    this.http.post<any>('orders', body).subscribe({
      next: order => {
        this.checkoutLoading = false;

        if (this.paymentMethod() === 'upi') {
          this.activePayment.set(null);
          // Request dynamic UPI QR
          this.http.post<any>('payments/upi-qr', { orderId: order._id }).subscribe({
            next: pay => {
              this.activePayment.set(pay);
              this.showUpiOverlay.set(true);
            }
          });
        } else {
          // Cash/Card Checkout Success
          this.triggerInvoiceDownload(order._id);
          this.cartStore.clear();
          this.resetPosState();
        }
      },
      error: err => {
        this.checkoutLoading = false;
        alert(err.error?.message || 'Error processing POS order');
      }
    });
  }

  verifyUpiPayment() {
    const pay = this.activePayment();
    if (!pay) return;

    this.http.post(`payments/${pay._id}/verify`, { reference: 'REF-' + Date.now() }).subscribe({
      next: () => {
        this.showUpiOverlay.set(false);
        this.triggerInvoiceDownload(pay.orderId);
        this.cartStore.clear();
        this.resetPosState();
      }
    });
  }

  closeUpiOverlay() {
    this.showUpiOverlay.set(false);
    this.cartStore.clear();
    this.resetPosState();
  }

  triggerInvoiceDownload(orderId: string) {
    this.http.get<any>(`invoices/order/${orderId}`).subscribe({
      next: inv => {
        if (inv && inv.pdfUrl) {
          const downloadUrl = `http://localhost:3000${inv.pdfUrl}`;
          // Prompt user/cashier to download receipt
          window.open(downloadUrl, '_blank');
        }
      }
    });
  }

  resetPosState() {
    this.customerPhone = '';
    this.customerId = '';
    this.customerName.set('');
    this.couponCode = '';
    this.paymentMethod.set('cash');
    this.loadCatalog();
  }
}
