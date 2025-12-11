import { Component, Input } from '@angular/core';
import { ChartOptions, ChartType, ChartData } from 'chart.js';


@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent {
  @Input() barChartOptions: ChartOptions = {};
  @Input() barChartLabels: string[] = [];
  @Input() barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  @Input() barChartType: ChartType = 'bar';
  @Input() chartClass = '';
  @Input() chartStyle: { [key: string]: any } = {};

  /**
   * Chart.js options với tooltip tự động lấy unit từ dataset
   * code mẫu
  // barChartLabels = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4'];
  // barChartType: keyof ChartTypeRegistry = 'bar';
  // barChartData = {
  //   labels: this.barChartLabels, 
  //   datasets: [
  //     { data: [12, 19, 3, 5], label: 'Số lượng học sinh', backgroundColor: '#8c7851', barThickness: 20, unit: ' học sinh' },
  //     { data: [5, 8, 2, 7], label: 'Số học phí', backgroundColor: '#4caf50', barThickness: 20, unit: ' triệu VNĐ' }
  //   ]
  // };
   */
  get chartOptions(): ChartOptions {
    return {
      responsive: true,
      ...this.barChartOptions,
      plugins: {
        ...(this.barChartOptions.plugins || {}),
        tooltip: {
          ...(this.barChartOptions.plugins?.tooltip || {}),
          callbacks: {
            ...(this.barChartOptions.plugins?.tooltip?.callbacks || {}),
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              const unit = context.dataset.unit || '';
              return `${label}: ${value}${unit}`;
            }
          }
        }
      }
    };
  }
}
