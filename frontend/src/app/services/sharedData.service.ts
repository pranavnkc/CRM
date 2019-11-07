import { Injectable } from '@angular/core';
import { HttpService } from '../services/http.service';
@Injectable()
export class SharedDataService {
  leadStatus = [];
  submissionLeadStatus = [];
  leadActions = [];
  ip = '';
  constructor(private http: HttpService) {
    this.http.get(`api/leads/status/`).subscribe((res) => {
      this.leadStatus = res['status'];
      this.submissionLeadStatus = res['submission_status'];
      this.leadActions = res['lead_actions'];
    });
  }
}
