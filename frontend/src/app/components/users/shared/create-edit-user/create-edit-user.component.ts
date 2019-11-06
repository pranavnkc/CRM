import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormControlName } from '@angular/forms';
import { UserService } from '../../services';
import { AuthService } from '../../../../services/auth.service';
import { UsernameAlreadyExistsValidator } from '../../../../services/auth.service';
import { matchValidator } from '../../../../validators';
import { constants } from '../../../../constants';
export enum EditMode {
  Create = 0,
  Edit = 1
}

@Component({
  selector: 'app-create-edit-user',
  templateUrl: './create-edit-user.component.html',
  providers: [UserService]
})
export class CreateEditUserComponent implements OnInit {
  user: any;
  editMode: EditMode = EditMode.Create;
  form: FormGroup;
  userOptions: any;
  roleFilterOptions = [
    { 'key': 'sales-person', 'value': 'Sales Person - Closer' },
    { 'key': 'stage-1', 'value': 'Stage 1 - Prospector' },
    { 'key': 'team-manager', 'value': 'Team Manager' },
    { 'key': 'company-head', 'value': 'Company Head' },
    { 'key': 'admin', 'value': 'Admin' }
  ]
  constructor(private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private service: UserService,
    private authService: AuthService,
    private usernameAlreadyExistsValidator: UsernameAlreadyExistsValidator) {
    this.createForm();
    if (this.authService.role == 'company-head') {
      this.roleFilterOptions = this.roleFilterOptions.slice(0, 3);
    }
    else if (this.authService.role == 'team-manager') {
      this.roleFilterOptions = this.roleFilterOptions.slice(0, 2);
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      let id = params['id'];
      if (id) {
        this.form.removeControl('password');
        this.form.removeControl('confirm_password');
        this.form.controls.username.disable();
        this.editMode = EditMode.Edit;
        this.getUser(id);
      }
      else {
        this.editMode = EditMode.Create;
        this.form.controls.role.valueChanges.subscribe((val) => {
          if (['sales-person', 'team-manager', 'stage-1'].indexOf(val) != -1) {
            this.form.addControl('parent', new FormControl(null));
          }
          else {
            this.form.removeControl('parent');
          }
        })
        this.userOptions = this.route.snapshot.data.users.results;
      }
    });
    this.form.controls.role.valueChanges.subscribe((val) => {
      if (val == 'sales-person') {
        this.userOptions = this.route.snapshot.data.users.results.filter(u => u.groups[0].name == 'team-manager')
      }
      else if (val == 'team-manager') {
        this.userOptions = this.route.snapshot.data.users.results.filter(u => u.groups[0].name == 'company-head')
      }
    })
    console.log('EditMode', this);
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
      first_name: [null, Validators.required],
      last_name: [null, Validators.required],
      phone_number: [null, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
      username: [null, Validators.compose([Validators.required, Validators.pattern(constants.EMAIL_REGEXP)]), this.usernameAlreadyExistsValidator.checkUsername.bind(this.usernameAlreadyExistsValidator)],
      role: [null, Validators.required],
      password: [null, Validators.compose([Validators.required, Validators.pattern(constants.PASSWORD_REGEX)])],
      confirm_password: [null, Validators.compose([Validators.required, matchValidator("password")])],
    })
  }

  createUser() {
    (this.editMode ? this.service.updateUser(this.user.id, this.form.value) : this.service.createUser(this.form.value)).subscribe((res) => {
      this.router.navigate([this.route.parent.url]);
    }, (error) => {
      console.log(error)
    })
  }
}
