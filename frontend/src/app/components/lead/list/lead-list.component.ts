import { Component, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource} from '@angular/material';
import { LeadService } from '../services';
import { SharedDataService } from '../../../../app/services/sharedData.service';
import { PromptDialogComponent } from '../../dialogs/prompt-dialog/prompt-dialog.component';
import * as moment from 'moment';
import { constants } from '../../../../app/constants';
@Component({
  selector: 'app-lead-list',
  templateUrl: './lead-list.component.html',
  providers: [LeadService]
})
export class LeadListComponent implements OnInit {

  private allUsersChecked: boolean = false;
  moment = moment;
  leads: Array<any>;
  isAdvancedSearchEnabled: boolean = false;
  email: string;
  startDate: Date = null;
  endDate: Date = null;
  selectedFields = [];
  fields = [
    { "field": "lead_id", "display": "Lead ID", "selected": true },
    { "field": "created_on", "display": "Created Date", "selected": false },
    { "field": "lead_hash", "display": "Lead Hash", "selected": false },
    { "field": "status", "display": "Status", "selected": true },
    { "field": "assigned_to", "display": "Assigned To", "selected": true },
    { "field": "busines_name", "display": "Business Name", "selected": true },
    { "field": "salutation", "display": "Salutation", "selected": false },
    { "field": "name", "display": "Name", "selected": false },
    { "field": "phone_number", "display": "Phone Number", "selected": true, "cell": (element: any) => `${constants.formatPhone(element.business_detail.phone_number)}` },
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
  displayedColumns = [];
  dataSource = new MatTableDataSource();
  constructor(private dialog: MatDialog,
              private service: LeadService,
              private sharedDataService:SharedDataService) {}

  ngOnInit() {
    this.loadLeads();
    let selectedItems = JSON.parse(localStorage.getItem('selectedLeadFields'));
    if(selectedItems.length){
      for(let field of this.fields){
        if(selectedItems.indexOf(field.field)!=-1){
          field.selected = true;
        }
      }
    }
    this.displayedColumns = selectedItems;
  }
  
  private selectedFieldsChanged() {
    this.displayedColumns = this.fields.filter(field=> field.selected).map(field=>field.field);
    this.displayedColumns.push('actions');
    localStorage.setItem('selectedLeadFields', JSON.stringify(this.displayedColumns));
  }

  private loadLeads(): void {
    this.service.getLeads().subscribe(data => {
      this.dataSource.data = data.results;
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
  changeStatus(lead){
    this.service.updateLead(lead.id, {'status':lead.status}).subscribe((res)=>{
       console.log('status changed');
    })
  }
  comment(lead){
    let dialogRef = this.dialog.open(PromptDialogComponent, {
      width:"50%",
      data: { okButtonText:'Add Comment', cancelButtonText:'Cancel', title: 'Add Comment', message: 'Add a comment about this lead.' }
    });
    dialogRef.afterClosed().subscribe((data)=>{
        if(data){
            this.service.addComment(lead.id, {"comment":data}).subscribe((res)=>{

            })
        }
    })
  }
}
