import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormControlName } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatPaginator, MatSort, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { LeadService } from '../services';
import { SnackBarService, SpinnerService, FileLoaderService } from '../../../services'
import { SharedDataService } from '../../../../app/services/sharedData.service';
import { PromptDialogComponent } from '../../dialogs/prompt-dialog/prompt-dialog.component';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from '../../dialogs/alert-dialog/alert-dialog.component';
import { CallbackComponent } from '../callback/callback.component';
import { LeadAssignComponent } from '../lead-assign/lead-assign.component';
import { SaleComponent } from '../sale/sale.component';
import * as moment from 'moment';
import { constants } from '../../../../app/constants';
import { AuthService } from '../../../../app/services/auth.service';
@Component({
  selector: 'app-lead-list',
  templateUrl: './lead-list.component.html',
  providers: [LeadService]
})
export class LeadListComponent implements OnInit {
  templateFor: any;
  onFilterClick(templateFor: string) {
    console.log(templateFor);
    this.templateFor = templateFor;
  }
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
  include_raw_leads = false;
  inlineFormFields = {
    status: [null],
    salutation: [null],
    first_name: [null],
    last_name: [null],
    business_name: [null],
    phone_number: [null, Validators.compose([Validators.minLength(10), Validators.maxLength(10)])],
    email: [null, Validators.compose([Validators.pattern(constants.EMAIL_REGEXP)])],
    address_1: [null],
    address_2: [null],
    address_3: [null],
    address_4: [null],
    city_or_town: [null],
    county: [null],
    postcode: [null],
    amr: [null],
    utility_type: [null],
    related_meter: [null],
    can_sell_water: [null],
    current_electricity_supplier_new: [null],
    contract_duration: [null],
    s_andr3_status: [null],
    bilge_eac: [null],
    contract_end_date: [null],
    meter_serial_number: [null],
    supply_number: [null],
  }
  inlineEditForm: FormGroup;
  inlineEditedID: any;
  allConditions = [
    { 'key': 'exact', 'val': 'Exact' },
    { 'key': 'iexact', 'val': 'Insensitive Exact' },
    { 'key': 'contains', 'val': 'Contains' },
    { 'key': 'icontains', 'val': 'Insensitive Contains' },
    { 'key': 'range', 'val': 'Between' }
  ];
  conditions: any;
  fields = [];
  dateFields = ['created_on', 'contract_end_date', 'latest_callback'];
  role: any;
  displayedColumns = [];
  dataSource = new MatTableDataSource();
  public searchValue: any = {};
  public searchCondition: any = {};
  public searchOperator: any = {};

  constructor(private dialog: MatDialog,
    private fb: FormBuilder,
    private service: LeadService,
    private sharedDataService: SharedDataService,
    private snackBarService: SnackBarService,
    private spinnerService: SpinnerService,
    private fileLoader: FileLoaderService,
    public authService: AuthService) {
    console.log(this);
    this.fields = [
      { "field": "id", "display": "Lead ID", "selected": true },
      { "field": "source", "display": "Source", "selected": true },

      { "field": "created_on", "display": "Created Date", "selected": false, "fxFlex": "10%", "cell": (element: any) => `${element.created_on ? moment(element.created_on).format('MMM DD, YYYY ddd hh:mm A') : ''}` },
      {
        "field": "status", "display": "Disposition", "selected": true, "fieldType": "select", "options": this.sharedDataService.leadStatus
      },
      {
        "field": "submission_status", "display": "Stage", "selected": true
      },

      { "field": "assigned_to", "display": "Assigned To", filterField: 'assigned_to__username', "selected": true },
      { "field": "busines_name", 'filterField': 'busines_name', "display": "Business Name", "selected": true, "fieldType": "input" },
      {
        "field": "salutation", 'filterField': 'salutation', "display": "Salutation", "selected": false, "fieldType": "select", "options": [
          { "key": "Mr.", "value": "Mr." },
          { "key": "Mrs.", value: "Mrs." },
          { "key": "Miss", value: "Miss" },
          { "key": "Dr.", value: "Dr." },
          { "key": "Ms.", value: "Ms." },
          { "key": "Prof.", value: "Prof." },
          { "key": "Rev.", value: "Rev." },
        ]
      },
      { "field": "name", 'filterField': 'full_name', "display": "Name", "selected": false, "cell": (element: any) => `${element.first_name} ${element.middle_name || ""} ${element.last_name}`, "fieldType": "input" },
      { "field": "latest_callback", 'filterField': 'callbacks__datetime', "sortField": "callbacks__datetime", "display": "Next action date", "selected": false, "cell": (element: any) => `${element.latest_callback ? moment(element.latest_callback).format('MMM DD, YYYY dddd hh:mm A') : ''}` },
      { "field": "phone_number", 'filterField': 'phone_number', "display": "Phone Number", "selected": true, "cell": (element: any) => `${element.phone_number ? constants.formatPhone(element.phone_number) : ''}`, "fieldType": "phone" },
      { "field": "email", 'filterField': 'email', "display": "Email", "selected": false, "fieldType": "input" },
      { "field": "address_1", 'filterField': 'address_1', "display": "Address 1", "selected": false, "fieldType": "input" },
      { "field": "address_2", 'filterField': 'address_2', "display": "Address 2", "selected": false, "fieldType": "input" },
      { "field": "address_3", 'filterField': 'address_3', "display": "Address 3", "selected": false, "fieldType": "input" },
      { "field": "address_4", 'filterField': 'address_4', "display": "Address 4", "selected": false, "fieldType": "input" },
      { "field": "city_or_town", 'filterField': 'city_or_town', "display": "Town or City", "selected": false, "fieldType": "input" },

      { "field": "county", 'filterField': 'county', "display": "County", "selected": false, "fieldType": "input" },
      { "field": "postcode", 'filterField': 'postcode', "display": "Postcode", "selected": false, "fieldType": "input" },
      {
        "field": "utility_type", 'filterField': 'utility_type', "display": "Utility Type", "selected": false, "fieldType": "select", "options": [
          { "key": "gas", "value": "Gas" },
          { "key": "electricity", "value": "Electricity" },
        ]
      },
      { "field": "amr", 'filterField': 'amr', "display": "AMR", "selected": false, "fieldType": "input" },
      { "field": "current_electricity_supplier_new", 'filterField': 'current_electricity_supplier_new', "display": "Current Supplier", "selected": true, "fieldType": "select", "options": this.sharedDataService.supplierChoices, cell: (element: any) => `${constants.getElementFromList(this.sharedDataService.supplierChoices, 'key', element.current_electricity_supplier_new, 'display')}` },
      { "field": "contract_end_date", 'filterField': 'contract_end_date', "display": "Contract End Date", "selected": true, "fieldType": "date" },
      { "field": "meter_serial_number", 'filterField': 'meter_serial_number', "display": "Meter Serial", "selected": false, "fieldType": "input" },
      { "field": "supply_number", 'filterField': 'supply_number', "display": "MPAN/MPRN", "selected": false, "fieldType": "input" },
      {
        "field": "can_sell_water", 'filterField': 'can_sell_water', "display": "Can Sell Water", "selected": false, "fieldType": "select", "options": [
          { "key": true, "value": "Yes" },
          { "key": false, "value": "No" },
        ]
      },
    ]
    if (this.authService.role == 'admin') {
      this.fields[this.fields.length - 1] = {
        "field": "is_locked", 'filterField': 'is_locked', "display": "Locked?", "selected": false, "fieldType": "select", "options": [
          { "key": true, "value": "Yes" },
          { "key": false, "value": "No" },
        ]
      }
      this.inlineFormFields['is_locked'] = [null];
    }
    this.filterForm = this.fb.group({
      'field': [null, Validators.required],
      'condition': [null, Validators.required],
      'value': [null, Validators.required]
    });
    this.conditions = this.allConditions;
    this.inlineEditForm = this.fb.group(this.inlineFormFields)
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

    let selectedItems = (JSON.parse(localStorage.getItem('selectedLeadFields')) || []).filter((sf) => this.fields.find((f) => f.field == sf) || ['edit', 'select', 'actions'].indexOf(sf) != -1);
    if (selectedItems.length && selectedItems.length != JSON.parse(localStorage.getItem('selectedLeadFields')).length) {
      localStorage.setItem('selectedLeadFields', JSON.stringify(selectedItems));
    }
    if (selectedItems && selectedItems.length) {
      selectedItems = selectedItems.filter(f => f != 'lead_id')
      for (let field of this.fields) {
        if (selectedItems.indexOf(field.field) != -1) {
          field.selected = true;
        }
      }
    }
    else {
      selectedItems = ['edit', 'select', 'actions'].concat(this.fields.filter(field => field.selected).map((field) => field.field));
    }
    this.displayedColumns = selectedItems;
    this.buildInlineForm();
  }

  private selectedFieldsChanged() {
    this.displayedColumns = ['edit', 'select', 'actions'].concat(this.fields.filter(field => field.selected).map(field => field.field));
    localStorage.setItem('selectedLeadFields', JSON.stringify(this.displayedColumns));
    this.buildInlineForm();
  }
  private buildInlineForm() {
    let fields = {}
    for (let field in this.inlineFormFields) {
      if (this.displayedColumns.indexOf(field) != -1) {
        let f = this.inlineFormFields[field]
        f[0] = this.inlineEditForm.controls[field] ? this.inlineEditForm.controls[field].value : null;
        fields[field] = f
      }
    }
    this.inlineEditForm = this.fb.group(fields)
  }
  private loadLeads(pageIndex?: any, param?: string) {
    param = param || this.buildFilterAndGetLeads();
    this.spinnerService.showSpinner = true;
    let params = { 'page': pageIndex != undefined ? pageIndex + 1 : this.paginator.pageIndex + 1, 'page_size': this.paginator.pageSize || this.constants.defaultPageSize };
    if (param != undefined) {
      params['q'] = param;
    }
    if (this.include_raw_leads) {
      params['include_raw_leads'] = this.include_raw_leads;
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
      if (data) {
        this.spinnerService.showSpinner = true;
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
    this.service.getLeadExport({ 'leads': this.selection.selected.map((s) => s.id).join(","), 'fields': this.fields.filter(f => f.selected).map((f: any) => f.field).join(",") }).subscribe((res) => {
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
    let param = {};
    for (let key in this.searchValue) {
      let value;
      let filterField;
      if (this.searchCondition[key] && this.searchOperator[key]) {
        if (this.dateFields.indexOf(key) != -1) {
          let start_date = moment(this.searchValue[key]).format('YYYY-MM-DD')
          let end_date = moment(this.searchValue[key]).format('YYYY-MM-DD')
          value = `${start_date},${end_date}`;
          filterField = key + (key != 'contract_end_date' ? "__date__" : '__') + this.searchCondition[key];
        }
        else {
          filterField = key + "__" + this.searchCondition[key];
          value = this.searchValue[key];
        }
        param[filterField] = [value, this.searchOperator[key]];
      }
    }
    console.log(param);
    return JSON.stringify(param);

  }

  buildFilterAndGetLeads1() {
    if (!this.filterForm.valid) {
      return undefined;
    }
    let value;
    let filterField;
    if (this.dateFields.indexOf(this.filterForm.value.field) != -1) {
      let start_date = moment(this.filterForm.value.start_date).format('YYYY-MM-DD')
      let end_date = moment(this.filterForm.value.end_date).format('YYYY-MM-DD')
      value = `${start_date},${end_date}`;
      filterField = this.filterForm.value.field + (this.filterForm.value.field != 'contract_end_date' ? "__date__" : '__') + this.filterForm.value.condition;
    }
    else {
      filterField = (this.filterForm.value.field) + "__" + this.filterForm.value.condition;
      value = this.filterForm.value.value;
    }
    let param = JSON.stringify({ [filterField]: value })
    return param;
  }

  inlineEdit(row) {
    for (let field in this.inlineEditForm.controls) {
      this.inlineEditForm.controls[field].setValue(row[field]);
    }
    this.inlineEditedID = row.id;
  }

  update() {
    var data = JSON.parse(JSON.stringify(this.inlineEditForm.value));
    if (data.contract_end_date) {
      data.contract_end_date = moment(data.contract_end_date).format('YYYY-MM-DD');
    }
    this.service.updateLead(this.inlineEditedID, data, this.include_raw_leads).subscribe((res) => {
      this.inlineEditedID = null;
      this.loadLeads();
    })
  }

  submitForPR(lead, isHotTransfer?: Boolean) {
    if (!lead.contract_end_date || !lead.current_electricity_supplier_new || !lead.utility_type) {
      this.dialog.open(AlertDialogComponent, {
        width: "50%",
        data: { "msg": "Need to fill current supplier, contract End Date and Utility Date before PR." }
      });
      return
    }
    let title = isHotTransfer ? "Add HT Comment" : "Add PR Comment"
    let dialogRef = this.dialog.open(PromptDialogComponent, {
      width: "50%",
      data: { okButtonText: isHotTransfer ? "Add HT" : 'Add PR', cancelButtonText: 'Cancel', title: title, message: title }
    });
    dialogRef.afterClosed().subscribe((data) => {
      console.log(data);
      if (data) {
        this.service.submitForPR(lead.id, { "comment": data, "is_hot_transfer": isHotTransfer || false }, this.include_raw_leads).subscribe((res) => {
          this.loadLeads();
        }, (error) => {
          this.dialog.open(AlertDialogComponent, {
            width: "50%",
            data: { "msg": error.error['required'][0] }
          });
        })
      }

    })
  }
  submitForSale(lead) {
    let dialogRef = this.dialog.open(SaleComponent, {
      width: "90%",
      height: "90%",
      data: { lead: lead }
    });
  }
  deleteMultiple() {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "50%",
      data: { "message": "Do you want to delete selected leads?" }
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.service.deleteMultiple({ 'leads': this.selection.selected.map((s) => s.id) }).subscribe((res) => {
          this.loadLeads();
          this.selection.clear();
        })
      }
    })
  }
  raplicate(lead) {
    this.service.raplicate(lead.id).subscribe((res) => {
      let dialogRef = this.dialog.open(AlertDialogComponent, {
        width: "50%",
        data: { "msg": "Replicated lead ID is " + res['id'] }
      });
      dialogRef.afterClosed().subscribe((data) => {
        this.loadLeads();
      })
    })
  }
  clearSearch(field) {
    delete this.searchCondition[field];
    delete this.searchValue[field];
    delete this.searchOperator[field];
  }
}
