import { Injectable } from '@angular/core';
import { HttpService } from '../services/http.service';
@Injectable()
export class SharedDataService {
  leadStatus = [];
  submissionLeadStatus = [];
  leadActions = [];
  soldAsChoices = [];
  companyTypeChoices = [];
  renewalChoices = [];
  supplierChoices = [];
  qualityStatusChoices = [];
  campaignChoices = [];
  ip = '';
  constructor(private http: HttpService) {
    this.http.get(`api/leads/status/`).subscribe((res) => {
      this.leadStatus = res['status'];
      this.submissionLeadStatus = res['submission_status'];
      this.leadActions = res['lead_actions'];
      this.soldAsChoices = res['sold_as_choices'];
      this.companyTypeChoices = res['company_type_choices'];
      this.renewalChoices = res['renewal_choices'];
      this.supplierChoices = res['supplier_choices'];
      this.qualityStatusChoices = res['quality_status_choices'];
      this.qualityStatusChoices = res['quality_status_choices'];
      this.campaignChoices = res['campaign_choices'];
    });
  }
}
