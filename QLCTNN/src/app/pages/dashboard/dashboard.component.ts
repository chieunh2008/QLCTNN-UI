import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CongTrinhService } from 'src/app/services/cong-trinh.service';
import { ProjectTypeService } from 'src/app/services/project-type.service';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { MatDialog } from '@angular/material/dialog';
import * as L from 'leaflet';
import { DashboardDetailDialogComponent } from './dashboard-detail-dialog.component';
import { DashboardTypeDialogComponent } from './dashboard-type-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('slideVertical', [
      transition(':enter', [
        style({ transform: '{{enterTransform}}', opacity: 0 }),
        animate('320ms cubic-bezier(.25,.8,.25,1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ], { params: { enterTransform: 'translateY(12px)' } }),
      transition(':leave', [
        animate('260ms cubic-bezier(.25,.8,.25,1)', style({ transform: '{{leaveTransform}}', opacity: 0 }))
      ], { params: { leaveTransform: 'translateY(-12px)' } })
    ])
  ]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  // tab animation state
  selectedTabIndex = 0;
  private prevSelectedTabIndex = 0;
  animationState: 'down' | 'up' = 'down';

  loading = false;
  totalProjects = 0;
  totalTypes = 0;
  recentProjects: any[] = [];

  monitoringRows: any[] = [];
  hoverRow: any = null;

  // hovered type label
  hoverType: string = '';

  // type summary used for tiles
  typeSummary: Array<{ label: string, count: number, message: string }> = [];
  // Chart inputs for app-bar-chart
  barChartLabels: string[] = [];
  barChartData: any = { labels: [], datasets: [] };

  // Chart display options
  typeChartOptionsCompact: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { display: false }, grid: { display: false } },
      y: { beginAtZero: true }
    },
    plugins: { tooltip: { enabled: true } }
  };

  typeChartOptionsPopup: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { display: true, maxRotation: 45, autoSkip: false } },
      y: { beginAtZero: true }
    },
    plugins: { tooltip: { enabled: true } }
  };

  get chartInnerWidth(): string {
    const w = Math.max((this.barChartLabels?.length || 0) * 48, 600);
    return w + 'px';
  }
  private map?: L.Map;
  private mapMarkers: L.Marker[] = [];

  constructor(
    private congTrinhService: CongTrinhService,
    private projectTypeService: ProjectTypeService,
    private monitoringService: MonitoringService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadOverview();
    this.loadMonitoring();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }

  async loadOverview(): Promise<void> {
    this.loading = true;
    try {
      // load project types (used for labels)
      const typeRes: any = await this.projectTypeService.getAll({ pageIndex: 1, pageSize: 1000 });
      const types = typeRes?.data?.Items || typeRes?.data || typeRes || [];
      this.totalTypes = types.length;

      // load projects (no pagination) - we will get all with large page
      const projRes: any = await this.congTrinhService.getAll({ pageIndex: 1, pageSize: 10000 });
      const projects = projRes?.data?.Items || projRes?.data || projRes || [];
      this.totalProjects = projects.length;

      // compute distribution by type
      const counts: { [key: string]: number } = {};
      types.forEach((t: any) => counts[t.TenLoai || ('Loại ' + t.Id)] = 0);
      projects.forEach((p: any) => {
        const typeName = (types.find((t: any) => t.Id === p.LoaiId)?.TenLoai) || 'Chưa xác định';
        counts[typeName] = (counts[typeName] || 0) + 1;
      });

      this.barChartLabels = Object.keys(counts);
      this.barChartData = {
        labels: this.barChartLabels,
        datasets: [
          { data: this.barChartLabels.map(l => counts[l]), label: 'Số công trình', backgroundColor: '#8c7851', barThickness: 22 }
        ]
      };

      // build type summary for tiles
      this.typeSummary = this.barChartLabels.map(l => ({ label: l, count: counts[l], message: `${counts[l]} công trình` }))
        .sort((a: any, b: any) => b.count - a.count);

      // recent projects (top 5 by CreatedAt or first 5)
      this.recentProjects = projects.slice(0, 5);

    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu dashboard:', err);
    } finally {
      this.loading = false;
    }
  }

  async loadMonitoring(): Promise<void> {
    try {
      const res: any = await this.monitoringService.getDashboard();
      this.monitoringRows = res?.data || res || [];
      this.updateMapMarkers();
    } catch (err: any) {
      console.error('Lỗi tải monitoring:', err);
    }
  }

  statusClass(status: any): string {
    if (status == null) return 'status-other';
    const s = String(status).toLowerCase();

    // numeric explicit mapping: 0 = normal (green), 1 = warning (red)
    if (s === '0') return 'status-normal';
    if (s === '1') return 'status-warning';

    // textual statuses
    if (s.includes('warning')) return 'status-warning';
    if (s.includes('down') || s.includes('danger') || s.includes('critical')) return 'status-warning';
    if (s === 'active' || s === 'normal' || s === 'ok') return 'status-normal';

    // anything else: other (yellow)
    return 'status-other';
  }

  statusText(status: any): string {
    if (status == null) return 'N/A';
    const s = String(status).toLowerCase();

    // Numeric mapping: 0 => Bình thường, 1 => Cảnh báo
    if (s === '0') return 'Bình thường';
    if (s === '1') return 'Cảnh báo';

    if (s.includes('warning')) return 'Cảnh báo';
    if (s.includes('down') || s.includes('danger') || s.includes('critical')) return 'Cảnh báo';
    if (s === 'active' || s === 'normal' || s === 'ok') return 'Bình thường';
    return 'Khác';
  }

  openDetail(row: any): void {
    // Normalize row fields to expected param names for detail API
    const payload = {
      lctId: row.LCTId ?? row.lctId ?? row.LCTId,
      ctId: row.CTId ?? row.ctId ?? row.CTId,
      tenNguong: row.TenNguong ?? row.tenNguong ?? row.TenNguong,
      TenCongTrinh: row.TenCongTrinh ?? row.tenCongTrinh ?? row.tenCongTrinh
    } as any;

    this.dialog.open(DashboardDetailDialogComponent, { data: payload, width: '620px' });
  }

  openTypeChart(label: string): void {
    // Open full-screen dialog with the bar chart and highlight the selected label
    const data = {
      labels: this.barChartLabels,
      data: this.barChartData.datasets?.[0]?.data || [],
      selectedLabel: label
    };

    this.dialog.open(DashboardTypeDialogComponent, { data, width: '90vw', height: '80vh', panelClass: 'dashboard-type-dialog' });
  }

  onTabChanged(index: number): void {
    // determine direction: new index greater = down (slide from top to bottom), else up
    this.animationState = index > this.prevSelectedTabIndex ? 'down' : 'up';
    this.prevSelectedTabIndex = index;
    this.selectedTabIndex = index;
  }

  private initMap(): void {
    if (this.map) return;

    const tryInit = (attempt = 0) => {
      const el = document.getElementById('dashboard-map');
      if (!el) {
        if (attempt < 6) {
          // retry a few times in case element is rendered after view init
          setTimeout(() => tryInit(attempt + 1), 200);
        }
        return;
      }

      this.map = L.map('dashboard-map', { center: [16.07, 108.22], zoom: 6 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(this.map);

      // if monitoring data already loaded, render markers
      if (this.monitoringRows && this.monitoringRows.length) {
        this.updateMapMarkers();
      }
    };

    tryInit();
  }

  private updateMapMarkers(): void {
    if (!this.map) return;
    // clear
    this.mapMarkers.forEach(m => m.remove());
    this.mapMarkers = [];

    // get list of unique projects from monitoringRows

    // load projects to find coordinates
    this.congTrinhService.getAll({ pageIndex: 1, pageSize: 10000 }).then((res: any) => {
      const projects = res?.data?.Items || res?.data || res || [];
      const projMap: { [key: number]: any } = {};
      projects.forEach((p: any) => projMap[p.Id] = p);

      this.monitoringRows.forEach((r: any) => {
        const p = projMap[r.ctId];
        if (!p) return;
        const lat = Number(p.Lat);
        const lon = Number(p.Lon);
        if (isNaN(lat) || isNaN(lon)) return;

        const color = this.statusClass(r.status) === 'status-normal' ? '#16a34a' : (this.statusClass(r.status) === 'status-warning' ? '#f59e0b' : '#ef4444');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="${color}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`;
        const html = `<div class="map-marker-icon">${svg}</div>`;
        const icon = L.divIcon({ html, className: 'custom-div-icon', iconSize: [28, 28], iconAnchor: [14, 28] });

        const marker = L.marker([lat, lon], { icon });
        marker.bindTooltip(`<b>${r.tenCongTrinh}</b><br>${r.tenNguong}`, { direction: 'top', offset: [0, -10], opacity: 0.95 });
        marker.addTo(this.map!);
        this.mapMarkers.push(marker);
      });

      if (this.mapMarkers.length > 0) {
        const latLngs = this.mapMarkers.map(m => m.getLatLng());
        const bounds = L.latLngBounds(latLngs as any);
        if (this.map) {
          this.map.fitBounds(bounds.pad(0.2));
        }
      }
    }).catch(err => console.error(err));
  }
}

