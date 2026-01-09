
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { BarChartComponent } from './component/bar-chart/bar-chart.component';
import { SharedCardComponent } from './component/shared-card/shared-card.component';
import { ConfirmDialogComponent } from './component/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [BarChartComponent, SharedCardComponent, ConfirmDialogComponent],
  imports: [CommonModule, NgChartsModule, MatDialogModule, MatButtonModule, MatTabsModule],
  exports: [BarChartComponent, SharedCardComponent, NgChartsModule, ConfirmDialogComponent, MatTabsModule]
})
export class SharedModule {}
