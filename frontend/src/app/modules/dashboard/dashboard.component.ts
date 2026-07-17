import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '../../core/signals/auth.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);

  metrics = signal<any>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    lowStockCount: 0
  });

  recentOrders = signal<any[]>([]);
  stockAlerts = signal<any[]>([]);
  chartData = signal<any[]>([]);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.http.get<any>('dashboard/summary').subscribe({
      next: data => {
        this.metrics.set(data.metrics);
        this.recentOrders.set(data.recentOrders || []);
        this.chartData.set(data.chartData || []);

        // Load low stock items from inventory
        this.loadLowStock();
      }
    });
  }

  loadLowStock() {
    this.http.get<any>('inventory?lowStockOnly=true').subscribe({
      next: res => {
        // Map low stock data
        const alerts = res.items.map((item: any) => ({
          _id: item._id,
          productName: item.productId?.name || 'Low Stock Product',
          currentStock: item.currentStock,
          minStock: item.minStock
        }));
        this.stockAlerts.set(alerts);
      }
    });
  }

  getBarHeight(revenue: number): number {
    const maxVal = Math.max(...this.chartData().map(b => b.revenue), 1000);
    return Math.min((revenue / maxVal) * 200, 200); // Scale to 200px max height
  }
}
