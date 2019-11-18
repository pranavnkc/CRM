import { Injectable } from '@angular/core';
import { HttpService } from '../../../services';

@Injectable()
export class LeadService {

  constructor(private http: HttpService) {
  }

  getLeads(params: any) {
    return this.http.get('api/leads/', params);
  }

  getLead(id: any, includeRaw?: Boolean) {
    let url = `api/leads/${id}/`;
    if (includeRaw) {
      url = `api/leads/${id}/?include_raw_leads=true`;
    }
    return this.http.get(url);
  }
  updateLead(id: any, data: any, includeRaw?: Boolean) {
    let url = `api/leads/${id}/`;
    if (includeRaw) {
      url = `api/leads/${id}/?include_raw_leads=true`;
    }
    return this.http.patch(url, data);
  }
  createLead(data) {
    return this.http.post(`api/leads/`, data);
  }
  deleteLead(id: any) {
    return this.http.delete(`api/leads/${id}/`);
  }
  deleteMultiple(data) {
    return this.http.post(`api/leads/delete-multiple/`, data);
  }
  getLeadStatus() {
    return this.http.get(`api/leads/status/`);
  }
  addComment(id: any, data: any) {
    return this.http.post(`api/leads/${id}/comment/?include_raw_leads=true`, data);
  }
  getComments(id: any) {
    return this.http.get(`api/leads/${id}/comment/?include_raw_leads=true`);
  }
  getLeadExport(params: any) {
    return this.http.get(`api/leads/lead-export/?include_raw_leads=true`, params);
  }
  getLeadHistory(id: any, params: any) {
    return this.http.get(`api/leads/${id}/history/?include_raw_leads=true`, params);
  }
  submitForPR(id: any, data: any, includeRaw?: Boolean) {
    let url = `api/leads/${id}/submit-for-pr/`;
    if (includeRaw) {
      url = `api/leads/${id}/submit-for-pr/?include_raw_leads=true`;
    }
    return this.http.patch(url, data);
  }

  submitForSale(id: any, data: any, includeRaw?: Boolean) {
    let url = `api/leads/${id}/submit-for-sale/`;
    if (includeRaw) {
      url = `api/leads/${id}/submit-for-sale/?include_raw_leads=true`;
    }
    return this.http.patch(url, data);
  }
}
