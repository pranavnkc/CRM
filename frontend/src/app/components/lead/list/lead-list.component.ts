import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatTableDataSource, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { LeadService } from '../services';
import { SnackBarService, SpinnerService } from '../../../services'
import { SharedDataService } from '../../../../app/services/sharedData.service';
import { PromptDialogComponent } from '../../dialogs/prompt-dialog/prompt-dialog.component';
import { CallbackComponent } from '../callback/callback.component';
import { LeadAssignComponent } from '../lead-assign/lead-assign.component';
import * as moment from 'moment';
import { constants } from '../../../../app/constants';
import { AuthService } from '../../../../app/services/auth.service';
@Component({
  selector: 'app-lead-list',
  templateUrl: './lead-list.component.html',
  providers: [LeadService]
})
export class LeadListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  private allUsersChecked: boolean = false;
  moment = moment;
  leads: Array<any>;
  isAdvancedSearchEnabled: boolean = false;
  email: string;
  startDate: Date = null;
  endDate: Date = null;
  selectedFields = [];
  constants = constants;
  selection = new SelectionModel<any>(true, []);
  fields = [
    { "field": "id", "display": "Lead ID", "selected": true },
    { "field": "created_on", "display": "Created Date", "selected": false },
    { "field": "lead_hash", "display": "Lead Hash", "selected": false },
    { "field": "status", "display": "Status", "selected": true },
    { "field": "assigned_to", "display": "Assigned To", "selected": true },
    { "field": "busines_name", "display": "Business Name", "selected": true },
    { "field": "salutation", "display": "Salutation", "selected": false },
    { "field": "name", "display": "Name", "selected": false },
    { "field": "latest_callback", "display": "Upcoming Callback", "selected": false, "cell": (element: any) => `${element.latest_callback ? moment(element.latest_callback).format('MMM DD, YYYY dddd hh:mm A') : ''}` },
    { "field": "phone_number", "display": "Phone Number", "selected": true, "cell": (element: any) => `${element.business_detail.phone_number ? constants.formatPhone(element.business_detail.phone_number) : ''}` },
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
  role: any;
  displayedColumns = [];
  dataSource = new MatTableDataSource();
  constructor(private dialog: MatDialog,
    private service: LeadService,
    private sharedDataService: SharedDataService,
    private snackBarService: SnackBarService,
    private spinnerService: SpinnerService,
    private authService: AuthService) { }

  ngOnInit() {
    this.role = this.authService.role;
    this.loadLeads();
    this.paginator.page.subscribe((pageConfig) => {
      this.loadLeads();
    })
    let selectedItems = JSON.parse(localStorage.getItem('selectedLeadFields'));
    if (selectedItems && selectedItems.length) {
      selectedItems = selectedItems.filter(f=>f!='lead_id')
      for (let field of this.fields) {
        if (selectedItems.indexOf(field.field) != -1) {
          field.selected = true;
        }
      }
    }
    else {
      selectedItems = ['select'].concat(this.fields.filter(field => field.selected).map((field) => field.field));
    }
    this.displayedColumns = selectedItems;
  }

  private selectedFieldsChanged() {
    this.displayedColumns = ['select'].concat(this.fields.filter(field => field.selected).map(field => field.field));
    this.displayedColumns.push('actions');
    localStorage.setItem('selectedLeadFields', JSON.stringify(this.displayedColumns));
  }

  private loadLeads(pageIndex?: any): void {
    this.spinnerService.showSpinner = true;
    this.service.getLeads({ 'page': this.paginator.pageIndex + 1, 'page_size': this.paginator.pageSize || this.constants.defaultPageSize }).finally(() => {
      this.spinnerService.showSpinner = false;
    }).subscribe(data => {
      this.dataSource.data = data.results;
      this.leads = data.results;
      this.dataSource.data = data['results'];
      this.paginator.length = data["count"];
      this.paginator.pageIndex = pageIndex == undefined ? this.paginator.pageIndex : pageIndex || 0;
    });
  }

  onRefresh() {
    this.leads = null;
    this.loadLeads();
    this.selection.clear();
  }

  checkAll() {
    this.allUsersChecked = !this.allUsersChecked;
    for (let i in this.leads) {
      this.leads[i].selected = this.allUsersChecked;
    }
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => {
        this.selection.select(row)
      });
  }
  changeStatus(lead) {
    this.service.updateLead(lead.id, { 'status': lead.status }).subscribe((res) => {
      console.log('status changed');
    })
  }
  comment(lead) {
    let dialogRef = this.dialog.open(PromptDialogComponent, {
      width: "50%",
      data: { okButtonText: 'Add Comment', cancelButtonText: 'Cancel', title: 'Add Comment', message: 'Add a comment about this lead.' }
    });
    dialogRef.afterClosed().subscribe((data) => {
      this.spinnerService.showSpinner = true;
      if (data) {
        this.service.addComment(lead.id, { "comment": data }).subscribe((res) => {
          this.spinnerService.showSpinner = false;
          this.snackBarService.open("Comment added successfully.")
        }, (err) => {
          this.spinnerService.showSpinner = false;
        })
      }
    })
  }

  assign() {
    let dialogRef = this.dialog.open(LeadAssignComponent, {
      width: "50%",
      data: { selectedleads: this.selection.selected }
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.onRefresh();
      }
    })
  }
  scheduleCallback(lead) {

    let dialogRef = this.dialog.open(CallbackComponent, {
      width: "50%",
      data: { lead: lead, dateTime: moment(), allMinuteOptions: true }
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.onRefresh();
      }
    })
  }
}
