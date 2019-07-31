import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormControlName } from '@angular/forms';
import { LeadService } from '../../services';
import { UsernameAlreadyExistsValidator } from '../../../../services/auth.service';
import { matchValidator } from '../../../../validators';
import { constants } from '../../../../constants';
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
  user: any;
  editMode: EditMode = EditMode.Create;
  form: FormGroup;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private service: LeadService,
    private usernameAlreadyExistsValidator: UsernameAlreadyExistsValidator) {
    this.createForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      let id = params['id'];
      if (id) {
        this.form.removeControl('password');
        this.form.removeControl('confirm_password');
        this.editMode = EditMode.Edit;
        this.getUser(id);
      }
      else {
        this.editMode = EditMode.Create;
      }
    });

    console.log('EditMode', EditMode[this.editMode], this.editMode);
  }

  private setUserData() {
    for (let field in this.form.controls) {
      this.form.controls[field].setValue(this.user[field]);
    }
  }
  private getUser(id: any) {
    this.service.getUser(id).subscribe((data) => {
      this.user = data
      this.setUserData();
    });
  }

  createForm() {
    this.form = this.fb.group({
      lead_hash: [null, Validators.required],
      business_detail: this.fb.group({
        salutation: [null, Validators.required],
        first_name: [null, Validators.required],
        middle_name: [null, Validators.required],
        last_name: [null, Validators.required],
        phone_number: [null, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
        email: [null, Validators.compose([Validators.required, Validators.pattern(constants.EMAIL_REGEXP)])],
        building_name: [null],
        subb: [null],
        building_number: [null],
        street_name: [null],
        town: [null],
        city: [null],
        county: [null]
      }),
      supply_detail: this.fb.group({
        meter_type: [null],
        meter_type_code: [null],
        domestic_meter: [null],
        amr: [null],
        related_meter: [null],
        current_electricity_supplier: [null],
        contract_end_date: [null],
        meter_serial_number: [null],
        supply_number: [null]
      })
    })
  }

  createLead() {
    (this.editMode ? this.service.updateLead(this.user.id, this.form.value) : this.service.createLead(this.form.value)).subscribe((res) => {
      this.router.navigate([this.route.parent.url]);
    }, (error) => {
      console.log(error)
    })
  }
}
