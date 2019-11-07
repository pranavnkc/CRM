import { Injectable } from '@angular/core';
import { HttpService } from '../services/http.service';
@Injectable()
export class SharedDataService {
  leadStatus = [];
  ip = '';
  constructor(private http: HttpService) {
    this.http.get(`api/leads/status/`).subscribe((res) => {
      this.leadStatus = res['status'];
    });
  }
}
