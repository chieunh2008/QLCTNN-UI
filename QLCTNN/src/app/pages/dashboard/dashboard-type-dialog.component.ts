import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard-type-dialog',
  templateUrl: './dashboard-type-dialog.component.html',
  styleUrls: ['./dashboard-type-dialog.component.css']
})
export class DashboardTypeDialogComponent implements OnInit {
  chartData: ChartData<'bar'> = { labels: [], datasets: [] };
  options: ChartOptions = { responsive: true, maintainAspectRatio: false };
  chartStyle: any = { height: '70vh', width: '700px' };

  private popupOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { display: true, maxRotation: 45, autoSkip: false } },
        y: { beginAtZero: true }
      },
      plugins: { tooltip: { enabled: true } }
    } as ChartOptions;
  }

  private calcWidth(labels: string[]): string {
    const w = Math.max((labels?.length || 0) * 48, 700);
    return w + 'px';
  }
  constructor(
    private dialogRef: MatDialogRef<DashboardTypeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    const labels: string[] = this.data.labels || [];
    const values: number[] = (this.data.data || []).map((v: any) => Number(v)) || [];
    const selected: string = this.data.selectedLabel;

    const background = labels.map(l => (l === selected ? '#ff9800' : '#8c7851'));

    this.chartData = {
      labels,
      datasets: [{ data: values, label: 'Số công trình', backgroundColor: background, barThickness: 28 }]
    };

    this.options = this.popupOptions();
    this.chartStyle = { height: '70vh', width: this.calcWidth(labels) };
  }

  get labels(): string[] {
    return (this.chartData.labels || []) as string[];
  }

  close(): void {
    this.dialogRef.close();
  }
}
