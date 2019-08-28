import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormControlName } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { LeadService } from '../services';
import { SnackBarService, SpinnerService, FileLoaderService } from '../../../services'
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
  @ViewChild(MatSort) sort: MatSort;
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
  filterForm: FormGroup;
  allConditions = [
    { 'key': 'exact', 'val': 'Exact' },
    { 'key': 'iexact', 'val': 'Insensitive Exact' },
    { 'key': 'contains', 'val': 'Contains' },
    { 'key': 'icontains', 'val': 'Insensitive Contains' },
    { 'key': 'range', 'val': 'Between' }
  ];
  conditions: any;
  fields = [
    { "field": "id", "display": "Lead ID", "selected": true },
    { "field": "created_on", "display": "Created Date", "selected": false, "fxFlex": "10%", "cell": (element: any) => `${element.created_on ? moment(element.created_on).format('MMM DD, YYYY dddd hh:mm A') : ''}` },
    { "field": "lead_hash", "display": "Lead Hash", "selected": false, "fxFlex": "15%" },
    { "field": "status", "display": "Status", "selected": true },
    { "field": "assigned_to", "display": "Assigned To", "selected": true },
    { "field": "busines_name", 'filterField': 'business_detail__busines_name', "display": "Business Name", "selected": true },
    { "field": "salutation", 'filterField': 'business_detail__salutation', "display": "Salutation", "selected": false },
    { "field": "name", 'filterField': 'full_name', "display": "Name", "selected": false, "cell": (element: any) => `${element.business_detail.first_name} ${element.business_detail.middle_name} ${element.business_detail.last_name}` },
    { "field": "latest_callback", 'filterField': 'callbacks__datetime', "display": "Upcoming Callback", "selected": false, "cell": (element: any) => `${element.latest_callback ? moment(element.latest_callback).format('MMM DD, YYYY dddd hh:mm A') : ''}` },
    { "field": "phone_number", 'filterField': 'business_detail__phone_number', "display": "Phone Number", "selected": true, "cell": (element: any) => `${element.business_detail.phone_number ? constants.formatPhone(element.business_detail.phone_number) : ''}` },
    { "field": "email", 'filterField': 'business_detail__email', "display": "Email", "selected": false },
    { "field": "building_name", 'filterField': 'business_detail__building_name', "display": "Building Name", "selected": false },
    { "field": "subb", 'filterField': 'business_detail__subb', "display": "Subb", "selected": false },
    { "field": "building_number", 'filterField': 'business_detail__building_number', "display": "Building Number", "selected": false },
    { "field": "street_name", 'filterField': 'business_detail__street_name', "display": "Street Name", "selected": false },
    { "field": "town", 'filterField': 'business_detail__town', "display": "Town", "selected": false },
    { "field": "city", 'filterField': 'business_detail__city', "display": "City", "selected": false },
    { "field": "county", 'filterField': 'business_detail__county', "display": "County", "selected": false },
    { "field": "meter_type", 'filterField': 'supply_detail__meter_type', "display": "Meter Type", "selected": false },
    { "field": "meter_type_code", 'filterField': 'supply_detail__meter_type_code', "display": "Meter Type Code", "selected": false },
    { "field": "domestic_meter", 'filterField': 'supply_detail__domestic_meter', "display": "Domestic Meter", "selected": false },
    { "field": "amr", 'filterField': 'supply_detail__amr', "display": "AMR", "selected": false },
    { "field": "related_meter", 'filterField': 'supply_detail__related_meter', "display": "Related Meter", "selected": false },
    { "field": "current_electricity_supplier", 'filterField': 'supply_detail__current_electricity_supplier', "display": "Current Supplier", "selected": true },
    { "field": "contract_end_date", 'filterField': 'supply_detail__contract_end_date', "display": "Contract End Date", "selected": true },
    { "field": "meter_serial_number", 'filterField': 'supply_detail__meter_serial_number', "display": "Meter Serial", "selected": false },
    { "field": "supply_number", 'filterField': 'supply_detail__supply_number', "display": "Supply Number", "selected": false },
  ]
  dateFields = ['created_on', 'supply_detail__contract_end_date'];
  role: any;
  displayedColumns = [];
  dataSource = new MatTableDataSource();
  constructor(private dialog: MatDialog,
    private fb: FormBuilder,
    private service: LeadService,
    private sharedDataService: SharedDataService,
    private snackBarService: SnackBarService,
    private spinnerService: SpinnerService,
    private fileLoader: FileLoaderService,
    private authService: AuthService) {
    this.filterForm = this.fb.group({
      'field': [null, Validators.required],
      'condition': [null, Validators.required],
      'value': [null, Validators.required]
    });
    this.conditions = this.allConditions;
  }

  ngOnInit() {
    this.filterForm.controls.field.valueChanges.subscribe((val) => {
      if (this.dateFields.indexOf(val.toLowerCase()) != -1 && !this.filterForm.controls['start_date']) {
        this.filterForm.addControl('start_date', new FormControl(null, Validators.required));
        this.filterForm.addControl('end_date', new FormControl(null, Validators.required));
        this.filterForm.removeControl('value');
        this.conditions = [
          { 'key': 'range', 'val': 'Between' }
        ];
      }
      else {
        if (this.filterForm.controls['start_date']) {
          this.conditions = this.allConditions;
          this.filterForm.removeControl('start_date');
          this.filterForm.removeControl('end_date')
          this.filterForm.addControl('value', new FormControl(null, Validators.required));
        }
      }
    })
    this.role = this.authService.role;
    this.loadLeads();
    this.paginator.page.subscribe((pageConfig) => {
      this.loadLeads();
    })
    this.sort.sortChange.subscribe((s) => {
      this.loadLeads();
    })
    let selectedItems = JSON.parse(localStorage.getItem('selectedLeadFields'));
    if (selectedItems && selectedItems.length) {
      selectedItems = selectedItems.filter(f => f != 'lead_id')
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

  private loadLeads(pageIndex?: any, param?: string) {
    param = param || this.buildFilterAndGetLeads();
    this.spinnerService.showSpinner = true;
    let params = { 'page': pageIndex != undefined ? pageIndex + 1 : this.paginator.pageIndex + 1, 'page_size': this.paginator.pageSize || this.constants.defaultPageSize };
    if (param != undefined) {
      params['q'] = param;
    }
    if (this.sort.direction) {
      params['sortBy'] = this.sort.active;
      params['sortOrder'] = this.sort.direction;
    }
    this.service.getLeads(params).finally(() => {
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
  getLeadExport() {
    this.service.getLeadExport({ 'leads': this.selection.selected.map((s) => s.id).join(","), 'fields': this.fields.filter(f => f.selected).map((f: any) => f.filterField || f.field).join(",") }).subscribe((res) => {
      this.fileLoader.downloadFile('/' + res.file);
    });
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
  buildFilterAndGetLeads() {
    if (!this.filterForm.valid) {
      return undefined;
    }
    let value;
    let filterField;
    if (this.dateFields.indexOf(this.filterForm.value.field) != -1) {
      let start_date = moment(this.filterForm.value.start_date).format('YYYY-MM-DD')
      let end_date = moment(this.filterForm.value.end_date).format('YYYY-MM-DD')
      value = `${start_date},${end_date}`;
      filterField = this.filterForm.value.field + (this.filterForm.value.field != 'supply_detail__contract_end_date' ? "__date__" : '__') + this.filterForm.value.condition;
    }
    else {
      filterField = this.filterForm.value.field + "__" + this.filterForm.value.condition;
      value = this.filterForm.value.value;
    }
    let param = JSON.stringify({ [filterField]: value })
    return param;
  }
}
