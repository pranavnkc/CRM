import { Injectable } from '@angular/core';
import { HttpService } from '../../../services';

@Injectable()
export class LeadService {

  constructor(private http: HttpService) {
  }

  getLeads(params: any) {
    return this.http.get('api/leads/', params);
  }

  getLead(id: any) {
    return this.http.get(`api/leads/${id}/`);
  }
  updateLead(id: any, data: any) {
    return this.http.patch(`api/leads/${id}/`, data);
  }
  createLead(data) {
    return this.http.post(`api/leads/`, data);
  }
  deleteLead(id: any) {
    return this.http.delete(`api/leads/${id}/`);
  }
  getLeadStatus() {
    return this.http.get(`api/leads/status/`);
  }
  addComment(id: any, data: any) {
    return this.http.post(`api/leads/${id}/comment/`, data);
  }
  getComments(id: any) {
    return this.http.get(`api/leads/${id}/comment/`);
  }
  getLeadExport(params: any) {
    return this.http.get(`api/leads/lead-export/`, params);
  }
  getLeadHistory(id: any, params: any) {
    return this.http.get(`api/leads/${id}/history/`, params);

  }
