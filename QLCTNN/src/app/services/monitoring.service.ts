import { Injectable } from '@angular/core';
import { BaseHttpClient } from './http/base-http-client';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class MonitoringService extends BaseHttpClient {
  // Use the existing Analyze controller paths provided
  private apiBase = `${environment.apiBaseUrl}/CongTrinh/Analyze`;

  constructor(protected override http: HttpClient) {
    super(http);
  }

  // GET https://.../api/CongTrinh/Analyze/Dashboard
  async getDashboard(): Promise<any> {
    return this.getRequest({ url: `${this.apiBase}/Dashboard` });
  }

  // POST https://.../api/CongTrinh/Analyze/Detail with body { lctId, ctId, tenNguong }
  async getNguongDetail(lctId: number, ctId: number, tenNguong: string): Promise<any> {
    return this.postRequest({ url: `${this.apiBase}/Detail`, body: { lctId, ctId, tenNguong } });
  }
}
