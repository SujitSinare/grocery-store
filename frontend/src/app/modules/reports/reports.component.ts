import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './reports.component.html'
})
export class ReportsComponent {
  private http = inject(HttpClient);

  exportExcel() {
    this.http.get<{ downloadUrl: string }>('reports/export/excel').subscribe({
      next: res => {
        if (res && res.downloadUrl) {
          window.open(`http://localhost:3000${res.downloadUrl}`, '_blank');
        }
      }
    });
  }

  exportPdf() {
    this.http.get<{ downloadUrl: string }>('reports/export/pdf').subscribe({
      next: res => {
        if (res && res.downloadUrl) {
          window.open(`http://localhost:3000${res.downloadUrl}`, '_blank');
        }
      }
    });
  }
}
