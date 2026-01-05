import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard-detail-dialog',
  templateUrl: './dashboard-detail-dialog.component.html',
  styleUrls: ['./dashboard-detail-dialog.component.css']
})
export class DashboardDetailDialogComponent implements OnInit {
  loading = false;
  lineData: ChartData<'line'> = { labels: [], datasets: [] };
  options: ChartOptions = { responsive: true, maintainAspectRatio: false };

  constructor(
    private dialogRef: MatDialogRef<DashboardDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private monitoringService: MonitoringService
  ) {}

  ngOnInit(): void {
    this.loadChart();
  }

  async loadChart(): Promise<void> {
    this.loading = true;
    try {
      const res: any = await this.monitoringService.getNguongDetail(this.data.lctId, this.data.ctId, this.data.tenNguong);
      // API returns array of { Date, Value } or wrapped in data
      const items = res?.data || res || [];
      if (!items || items.length === 0) {
        this.lineData = { labels: [], datasets: [] };
        return;
      }

      const labels = items.map((i: any) => new Date(i.Date).toLocaleDateString());
      const values = items.map((i: any) => Number(i.Value));

      this.lineData = {
        labels,
        datasets: [
          { data: values, label: this.data.tenNguong || this.data.TenNguong, borderColor: '#3f51b5', backgroundColor: 'rgba(63,81,181,0.1)', tension: 0.3 }
        ]
      };
    } catch (err: any) {
      console.error('Load detail error', err);
    } finally {
      this.loading = false;
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
