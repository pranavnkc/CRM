import { Injectable } from '@angular/core';
import { HttpService } from '../services/http.service';
@Injectable()
export class SharedDataService {
  leadStatus = [];
  constructor(private http: HttpService) {
    console.log("asdasd");
    this.http.get(`api/leads/status/`).subscribe((res) => {
      this.leadStatus = res;
    });
  }
}
