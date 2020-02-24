import { Component, OnInit, Inject, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormControlName } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpService, SharedDataService } from '../../../services/index';
import { AuthService } from '../../../services/auth.service';
import { UsernameAlreadyExistsValidator } from '../../../services/auth.service';
import { matchValidator } from '../../../validators';
import { constants } from '../../../constants';
import { LeadService } from '../services/lead.service';
import * as moment from 'moment';
export enum EditMode {
  Create = 0,
  Edit = 1
}

@Component({
  selector: 'app-sale',
  templateUrl: './sale.component.html',
  styleUrls: ['./sale.component.css'],
  providers: [LeadService]
})
export class SaleComponent implements OnInit {
  lead: any;
  editMode: EditMode = EditMode.Create;
  form: FormGroup;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private service: HttpService,
    public sharedDataService: SharedDataService,
    public authService: AuthService,
    private leadService: LeadService,
    private activatedRoute: ActivatedRoute,
    private usernameAlreadyExistsValidator: UsernameAlreadyExistsValidator,
    @Optional() public dialogRef: MatDialogRef<SaleComponent>, @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    this.createForm();
    console.log(this);
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((data) => {
      if (data.data) {
        this.editMode = EditMode.Edit;
        this.lead = JSON.parse(data.data);
        this.setLeadData();
      }
      else {
        this.editMode = EditMode.Create;
        this.lead = this.data;
        this.setLeadData();
      }
      console.log('EditMode', EditMode[this.editMode], this.editMode);
    })

  }

  private setLeadData() {
    for (let field in this.form.controls['lead']['controls']) {
      this.form.controls['lead']['controls'][field].setValue(this.lead['lead'][field]);
    }
    for (let field in this.form.controls) {
      if (field != 'lead')
        this.form.controls[field].setValue(this.lead[field]);
    }
  }
  createForm() {
    this.form = this.fb.group({
      date_sold: [null],
      sold_as: [null],
      multi_site: [false],
      company_type: [null],
      company_reg: [null],
      position_in_company: [null],
      ebilling: [false],
      receive_marketing: [false],
      full_address: [null],
      time_at_address: [null],
      sole_trader_dob: [null],
      full_billing_address: [null],
      renewal_acquisition: [null],
      new_supplier: [null],
      top_row: [null],
      bottom_row: [null],
      start_date: [null],
      days: [null],
      eac_submitted: [null],
      tariif_code: [null],
      standing_charge: [null],
      standing_charge_uplift: [null],
      unit_rate: [null],
      day_rate: [null],
      night_rate: [null],
      weekday_rate: [null],
      eve_weekened_rate: [null],
      eve_weekend_night_rate: [null],
      uplift: [null],
      sc_comm: [null],
      eac_comm: [null],
      total_comm: [null],
      total_comm_on_submission: [null],
      agenct_comm_percentage: [null],
      agenct_comm_amount: [null],
      bill_received: [null],
      existing_contract_cancelled: [null],
      bank_name: [null],
      account_name: [null],
      account_number: [null],
      account_sort_code: [null],
      data_source: [null],
      comment: [null],
      lead: this.fb.group({
        salutation: [null],
        first_name: [null],
        middle_name: [null,],
        last_name: [null,],
        phone_number: [null, Validators.compose([Validators.minLength(10), Validators.maxLength(10)])],
        busines_name: [null],
        email: [null, Validators.compose([Validators.pattern(constants.EMAIL_REGEXP)])],
        address_1: [null],
        address_2: [null],
        address_3: [null],
        address_4: [null],
        town_or_city: [null],
        county: [null],
        postcode: [null],
        utility_type: [null],
        amr: [null],
        contract_duration: [null],
        can_sell_water: [false],
        s_andr3_status: [null],
        bilge_eac: [null],
        related_meter: [null],
        current_electricity_supplier_new: [null],
        contract_end_date: [null],
        meter_serial_number: [null],
        supply_number: [null],
        is_locked: [false]
      })
    })
  }

  sale() {
    console.log(this.form);
    var data = JSON.parse(JSON.stringify(this.form.value));
    if (data.contract_end_date) {
      data.contract_end_date = moment(data.contract_end_date).format('YYYY-MM-DD');
    }
    if (data.sole_trader_dob) {
      data.sole_trader_dob = moment(data.sole_trader_dob).format('YYYY-MM-DD');
    }
    if (data.start_date) {
      data.start_date = moment(data.start_date).format('YYYY-MM-DD');
    }
    if (data.date_sold) {
      data.date_sold = moment(data.date_sold).format('YYYY-MM-DD');
    }
    if (data.lead.supply_number == this.lead.lead.supply_number) {
      delete data['lead']['supply_number']
    }
    if (!this.editMode) {
      this.leadService.submitForSale(this.data.lead.id, data).subscribe((res) => {
        this.router.navigate([this.route.parent.url]);
      }, (error) => {
        console.log(error)
      })
    }
    else {
      this.service.patch(`api/sales/${this.lead.id}/`, data).subscribe((res) => {

      })
    }
  }
  changeStatus(status) {
    this.service.patch(`api/sales/${this.lead.id}/change-status/`, { 'quality_status': status }).subscribe((res) => {
    });
  }
}
