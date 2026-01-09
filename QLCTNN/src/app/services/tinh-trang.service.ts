import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BaseHttpClient } from './http/base-http-client';

@Injectable({
  providedIn: 'root'
})
export class TinhTrangService extends BaseHttpClient {
  private apiUrl = `${environment.apiBaseUrl}/ThongSoHis`;

  constructor(protected override http: HttpClient) {
    super(http);
  }

  async getAll(data: any): Promise<any> {
    return this.postRequest({
      url: `${this.apiUrl}/GetAll`,
      body: data
    });
  }

  // New: Get list of current thresholds/statuses (non-paginated)
  async getList(): Promise<any> {
    return this.getRequest({
      url: `${this.apiUrl}/GetList`,
    });
  }

  // New: delete threshold by key (LCTId, CTId, TenNguong)
  async deleteByKey(payload: any): Promise<any> {
    return this.postRequest({
      url: `${this.apiUrl}/DeleteByKey`,
      body: payload
    });
  }

  async getById(id: number): Promise<any> {
    return this.postRequest({
      url: `${this.apiUrl}/GetById?id=${id}`,
      body: id
    });
  }
  async getByCTId(data:any): Promise<any> {
    return this.postRequest({
      url: `${this.apiUrl}/GetByCTId`,
      body: data
    });
  }

  async create(data: any): Promise<any> {
    return this.postRequest({
      url: `${this.apiUrl}/CreateOrUpdate`,
      body: data
    });
  }

  async update(data: any): Promise<any> {
    return this.postRequest({
      url: `${this.apiUrl}/CreateOrUpdate`,
      body: data
    });
  }

  async delete(id: number): Promise<any> {
    return this.deleteRequest({
      url: `${this.apiUrl}/Delete/${id}`,
    });
  }
}
