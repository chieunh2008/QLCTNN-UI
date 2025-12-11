import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponseMeta {
  error_code: number;
  error_message: string;
}

export interface LoginResponseData {
  AccessKey: string;
  AccessToken: string;
  RoleCode: string;
  BaseUrlImg: string;
  BaseUrlFile: string;
  listMenus: any[];
  FullName: string;
  UserName: string;
  Password: string | null;
  Dob: string;
  Phone: string;
  Email: string;
  Address: string;
  Avatar: string;
  KeyLock: string | null;
  LastLogin: string;
  RegEmail: string | null;
  RoleMax: number;
  RoleLevel: number;
  PasswordKeyCloak: string;
  AddedOnKeyCloak: boolean;
  ModuleSystem: number;
  CreatedById: number;
  UpdatedById: number;
  CreatedBy: string;
  UpdatedBy: string;
  Id: number;
  Status: number;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface LoginResponse {
  meta: LoginResponseMeta;
  data: LoginResponseData;
  metadata: any;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private apiLoginUrl = `${environment.apiBaseUrl}${environment.endpoints.login}`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { username, password };

    return this.http.post<LoginResponse>(this.apiLoginUrl, loginRequest).pipe(
      tap((response: LoginResponse) => {
        if (response.meta.error_code === 200 && response.data.AccessToken) {
          // Store token in sessionStorage/localStorage
          sessionStorage.setItem('token', response.data.AccessToken);
          localStorage.setItem('token', response.data.AccessToken);

          // Store additional user information in localStorage
          localStorage.setItem('userName', response.data.UserName);
          localStorage.setItem('fullName', response.data.FullName);
          localStorage.setItem('userId', response.data.Id.toString());
          localStorage.setItem('userEmail', response.data.Email);
          localStorage.setItem('userAvatar', response.data.Avatar);
          localStorage.setItem('userRole', response.data.RoleCode);
          localStorage.setItem('baseUrlImg', response.data.BaseUrlImg);
          localStorage.setItem('baseUrlFile', response.data.BaseUrlFile);
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('fullName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('userRole');
    localStorage.removeItem('baseUrlImg');
    localStorage.removeItem('baseUrlFile');
  }

  getStoredUsername(): string | null {
    return localStorage.getItem('userName');
  }

  getStoredUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getStoredUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  getStoredUserAvatar(): string | null {
    return localStorage.getItem('userAvatar');
  }

  getStoredUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getStoredBaseUrlImg(): string | null {
    return localStorage.getItem('baseUrlImg');
  }

  getStoredBaseUrlFile(): string | null {
    return localStorage.getItem('baseUrlFile');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  }

  register(userData: any): Observable<LoginResponse> {
    const registerUrl = `${environment.apiBaseUrl}/User/register`;
    
    return this.http.post<LoginResponse>(registerUrl, userData).pipe(
      tap((response: LoginResponse) => {
        if (response.meta.error_code === 200 && response.data.AccessToken) {
          sessionStorage.setItem('token', response.data.AccessToken);
          localStorage.setItem('token', response.data.AccessToken);
          
          localStorage.setItem('userName', response.data.UserName);
          localStorage.setItem('fullName', response.data.FullName);
          localStorage.setItem('userId', response.data.Id.toString());
          localStorage.setItem('userEmail', response.data.Email);
          localStorage.setItem('userAvatar', response.data.Avatar);
          localStorage.setItem('userRole', response.data.RoleCode);
          localStorage.setItem('baseUrlImg', response.data.BaseUrlImg);
          localStorage.setItem('baseUrlFile', response.data.BaseUrlFile);
        }
      }),
      catchError((error) => {
        console.error('Register error:', error);
        throw error;
      })
    );
  }
}
