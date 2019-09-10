import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { SpinnerService } from './spinner.service';
import { constants } from '../constants';
import 'rxjs/Rx';

@Injectable()
export class HttpService {
  private baseUrl: string;
  public contentType: string;
  constructor(private http: HttpClient, private router: Router, private spinnerService: SpinnerService) {
    this.baseUrl = environment.baseUrl;
  }

  private getHeaders(contentType?: any): HttpHeaders {
    let headers = new HttpHeaders()

    let token = localStorage.getItem('token');

    if (token) {
      // HttpHeaders are immutable, set() method returns new instance of HttpHeaders
      headers = headers.set('Authorization', `Token ${token}`);
      headers = headers.set('client-ip', `${constants.ipAddress ? constants.ipAddress : ''}`);
    }

    return headers;
  }

  private onError(error: any): Promise<any> {
    if (error.status === 401 || error.status === 403) {
      //this.router.navigate(['/login']);
    }
    this.spinnerService.showSpinner = false;
    return Promise.reject(error);
  }

  /**
   * Executes GET request for specified url.
   * @param url Url to execute.
   */
  get(url: string, params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}${url}`, {
      headers: this.getHeaders(),
      params: params
    }).catch(error => this.onError(error));
  }

  delete(url: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${url}`, {
      headers: this.getHeaders()
    }).catch(error => this.onError(error));
  }

  /**
   * Executes POST request with specified url and data
   * @param url Request Url.
   * @param data Post data.
   */
  post(url: string, data: any, contentType?: any): Observable<any> {

    return this.http.post(`${this.baseUrl}${url}`, data, {
      headers: this.getHeaders(contentType)
    }).catch(error => this.onError(error));
  }
  patch(url: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}${url}`, data, {
      headers: this.getHeaders()
    }).catch(error => this.onError(error));
  }
}
