
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { BarChartComponent } from './component/bar-chart/bar-chart.component';
import { SharedCardComponent } from './component/shared-card/shared-card.component';

@NgModule({
  declarations: [BarChartComponent, SharedCardComponent],
  imports: [CommonModule, NgChartsModule],
  exports: [BarChartComponent, SharedCardComponent, NgChartsModule]
})
export class SharedModule {}
