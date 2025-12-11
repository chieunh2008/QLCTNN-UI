import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BaseHttpClient } from './http/base-http-client';

@Injectable({
  providedIn: 'root'
})
export class ProjectTypeService extends BaseHttpClient {
  private apiUrl = `${environment.apiBaseUrl}/LoaiCongTrinh`;

  constructor(protected override http: HttpClient) {
    super(http);
  }

  async getAll(data: any): Promise<any> {
    return this.postRequest({
      url: `${this.apiUrl}/GetAll`,
      body: data
    });
  }

  async getById(id: number): Promise<any> {
    return this.postRequest({
      url: `${this.apiUrl}/GetById?id=${id}`,
      body: id
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
    return this.postRequest({
      url: `${this.apiUrl}/Delete`,
      body: id
    });
  }
}
