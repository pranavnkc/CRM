import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormControlName } from '@angular/forms';
import { LeadService } from '../../services';
import { SharedDataService } from '../../../../services/sharedData.service';
import { UsernameAlreadyExistsValidator } from '../../../../services/auth.service';
import { matchValidator } from '../../../../validators';
import { constants } from '../../../../constants';
import * as moment from 'moment';
export enum EditMode {
  Create = 0,
  Edit = 1
}

@Component({
  selector: 'app-create-edit-lead',
  templateUrl: './create-edit-lead.component.html',
  providers: [LeadService]
})
export class CreateEditLeadComponent implements OnInit {
  lead: any;
  editMode: EditMode = EditMode.Create;
  form: FormGroup;
  moment = moment;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private service: LeadService,
    public sharedDataService: SharedDataService,
    private usernameAlreadyExistsValidator: UsernameAlreadyExistsValidator) {
    this.createForm();
  }

  ngOnInit() {
    console.log(this);
    this.route.params.subscribe(params => {
      let id = params['id'];
      if (id) {
        this.form.removeControl('password');
        this.form.removeControl('confirm_password');
        this.editMode = EditMode.Edit;
        this.getLead(id);
      }
      else {
        this.editMode = EditMode.Create;
      }
    });

    console.log('EditMode', EditMode[this.editMode], this.editMode);
  }

  private setLeadData() {
    for (let field in this.form.controls) {
      this.form.controls[field].setValue(this.lead[field]);
    }
  }
  private getLead(id: any) {
    this.service.getLead(id, true).subscribe((data) => {
      this.lead = data
      this.setLeadData();
    });
  }

  createForm() {
    this.form = this.fb.group({
      salutation: [null],
      first_name: [null],
      middle_name: [null,],
      last_name: [null,],
      phone_number: [null, Validators.compose([Validators.minLength(10), Validators.maxLength(10)])],
      email: [null, Validators.compose([Validators.pattern(constants.EMAIL_REGEXP)])],
      busines_name: [null],
      address_1: [null],
      address_2: [null],
      address_3: [null],
      address_4: [null],
      city_or_town: [null],
      county: [null],
      postcode: [null],
      utility_type: [null],
      amr: [null],
      contract_duration: [null],
      can_sell_water: [false],
      s_andr3_status: [null],
      bilge_eac: [null],
      related_meter: [null],
      current_electricity_supplier: [null],
      contract_end_date: [null],
      meter_serial_number: [null],
      supply_number: [null],
      is_locked: [false]
    })
  }

  createLead() {
    var data = JSON.parse(JSON.stringify(this.form.value));
    if (data.contract_end_date) {
      data.contract_end_date = moment(data.contract_end_date).format('YYYY-MM-DD');
    }
    (this.editMode ? this.service.updateLead(this.lead.id, data, true) : this.service.createLead(data)).subscribe((res) => {
      this.router.navigate([this.route.parent.url]);
    }, (error) => {
      console.log(error)
    })
  }
}
