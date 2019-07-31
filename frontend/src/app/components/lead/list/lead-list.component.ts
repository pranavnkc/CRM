import { Component, OnInit } from '@angular/core';

import { LeadService } from '../services';

@Component({
  selector: 'app-lead-list',
  templateUrl: './lead-list.component.html',
  providers: [LeadService]
})
export class LeadListComponent implements OnInit {

  private allUsersChecked: boolean = false;

  leads: Array<any>;
  isAdvancedSearchEnabled: boolean = false;
  email: string;
  startDate: Date = null;
  endDate: Date = null;
  fields = [
    { "field": "lead_id", "display": "Lead ID", "selected": true },
    { "field": "created_on", "display": "Created Date", "selected": false },
    { "field": "lead_hash", "display": "Lead Hash", "selected": false },
    { "field": "status", "display": "Status", "selected": true },
    { "field": "assigned_to", "display": "Assigned To", "selected": true },
    { "field": "busines_name", "display": "Business Name", "selected": true },
    { "field": "salutation", "display": "Salutation", "selected": false },
    { "field": "name", "display": "Name", "selected": false },
    { "field": "phone_number", "display": "Phone Number", "selected": true },
    { "field": "email", "display": "Email", "selected": false },
    { "field": "building_name", "display": "Building Name", "selected": false },
    { "field": "subb", "display": "Subb", "selected": false },
    { "field": "building_number", "display": "Building Number", "selected": false },
    { "field": "street_name", "display": "Street Name", "selected": false },
    { "field": "town", "display": "Town", "selected": false },
    { "field": "city", "display": "City", "selected": false },
    { "field": "county", "display": "County", "selected": false },
    { "field": "meter_type", "display": "Meter Type", "selected": false },
    { "field": "meter_type_code", "display": "Meter Type Code", "selected": false },
    { "field": "domestic_meter", "display": "Domestic Meter", "selected": false },
    { "field": "amr", "display": "AMR", "selected": false },
    { "field": "related_meter", "display": "Related Meter", "selected": false },
    { "field": "current_electricity_supplier", "display": "Current Supplier", "selected": true },
    { "field": "contract_end_date", "display": "Contract End Date", "selected": true },
    { "field": "meter_serial_number", "display": "Meter Serial", "selected": false },
    { "field": "supply_number", "display": "Supply Number", "selected": false },
  ]
  constructor(private service: LeadService) { }

  ngOnInit() {
    console.log(this);
    this.loadLeads();
  }
  public getSelectedFields() {
    return this.fields.filter((f) => f.selected);
  }

  private loadLeads(): void {
    this.service.getLeads().subscribe(data => {
      this.leads = data.results;
    });
  }

  onRefresh() {
    this.leads = null;
    this.loadLeads();
  }

  checkAll() {
    this.allUsersChecked = !this.allUsersChecked;
    for (let i in this.leads) {
      this.leads[i].selected = this.allUsersChecked;
    }
  }
}
