import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { CongTrinhService } from 'src/app/services/cong-trinh.service';

@Component({
  selector: 'app-project-location',
  templateUrl: './project-location.component.html',
  styleUrls: ['./project-location.component.css']
})
export class ProjectLocationComponent implements AfterViewInit, OnDestroy {
  loading = false;
  markersCount = 0;
  private map?: L.Map;
  private markers: L.Marker[] = [];
  private resizeHandler = () => { this.map?.invalidateSize(); };

  refresh(): void {
    this.loadProjects();
  }

  constructor(private congTrinhService: CongTrinhService) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.loadProjects();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    window.removeEventListener('resize', this.resizeHandler);
  }

  private initMap(): void {
    // Ensure default marker icons load (use CDN so we don't need to copy assets)
    const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png';
    const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
    const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png';
    (L.Icon.Default as any).mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl
    });

    this.map = L.map('map', {
      center: [16.0678, 108.2208], // default center (adjust as needed)
      zoom: 7
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Ensure layout and tiles render correctly (small timeout helps when container was hidden before)
    setTimeout(() => {
      this.map?.invalidateSize();
      console.log('Leaflet map initialized:', !!this.map);
    }, 200);

    // Keep map responsive to window/layout changes
    window.addEventListener('resize', this.resizeHandler);
  }

  private async loadProjects(): Promise<void> {
    try {
      const res: any = await this.congTrinhService.getAll({ pageIndex: 1, pageSize: 10000 });
      const responseData = res?.data || res;
      const items = responseData?.Items || responseData || [];
      this.addMarkers(items);
    } catch (err: any) {
      console.error('Lỗi khi tải dự án:', err);
    }
  }

  private addMarkers(items: any[]): void {
    if (!this.map) return;

    const latLngs: L.LatLngExpression[] = [];
    items.forEach((it) => {
      const lat = Number(it.Lat);
      const lon = Number(it.Lon);
      if (!isNaN(lat) && !isNaN(lon)) {
        // inline SVG for Material 'place' icon (simple pin)
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="#1976d2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`;
        const html = `<div class="map-marker-icon">${svg}</div>`;
        const icon = L.divIcon({ html, className: 'custom-div-icon', iconSize: [28, 28], iconAnchor: [14, 28] });
        const marker = L.marker([lat, lon], { icon, interactive: true });

        // Tooltip shows on hover (we also explicitly open/close for reliability)
        marker.bindTooltip(it.TenCongTrinh || 'Không tên', { direction: 'top', offset: [0, -10], opacity: 0.95, className: 'map-marker-tooltip' });
        marker.on('mouseover', () => (marker as any).openTooltip());
        marker.on('mouseout', () => (marker as any).closeTooltip());

        marker.addTo(this.map!);
        this.markers.push(marker);
        latLngs.push([lat, lon]);
      }
    });

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs as any);
      this.map.fitBounds(bounds.pad(0.2));
      // Recompute size after fitting bounds
      setTimeout(() => this.map?.invalidateSize(), 100);
    } else {
      console.log('No valid project coordinates found to display markers');
    }
  }
}