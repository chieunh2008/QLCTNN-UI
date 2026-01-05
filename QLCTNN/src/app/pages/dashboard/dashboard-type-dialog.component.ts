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

  constructor(
    private dialogRef: MatDialogRef<DashboardTypeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    const labels: string[] = this.data.labels || [];
    const values: number[] = (this.data.data || []).map((v: any) => Number(v)) || [];
    const selected: string = this.data.selectedLabel;

    const background = labels.map(l => (l === selected ? '#ff9800' : '#3f51b5'));

    this.chartData = {
      labels,
      datasets: [{ data: values, label: 'Số công trình', backgroundColor: background, barThickness: 28 }]
    };
  }

  close(): void {
    this.dialogRef.close();
  }
}
