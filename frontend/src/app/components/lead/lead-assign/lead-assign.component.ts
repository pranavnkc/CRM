import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService, SnackBarService, SpinnerService } from '../../../services';
@Component({
  selector: 'app-lead-assign',
  templateUrl: './lead-assign.component.html',
  styleUrls: ['./lead-assign.component.css']
})
export class LeadAssignComponent implements OnInit {
  form = new FormGroup({
    assignee: new FormControl(null, Validators.required)
  });
  salesPersons = [];
  constructor(public dialogRef: MatDialogRef<LeadAssignComponent>,
    private snackbarService: SnackBarService,
    private spinnerService: SpinnerService,
    private httpService: HttpService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    console.log(this);
    this.httpService.get('api/users/').subscribe((res: any) => {
      this.salesPersons = res.results;
    })
  }

  assign() {
    this.spinnerService.showSpinner = true;
    this.httpService.post('api/leads/assign/', { 'leads': this.data.selectedleads.map(l => l.id), 'assignee': this.form.value.assignee }).finally(() => {
      this.spinnerService.showSpinner = false;
    }).subscribe((re) => {
      this.snackbarService.open("Sales Person Assigned.");
      this.dialogRef.close('success');
    })
  }

}
