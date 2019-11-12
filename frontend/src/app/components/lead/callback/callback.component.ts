import { Component, Inject, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpService, SnackBarService, SpinnerService } from '../../../services';
import * as moment from 'moment';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {
  dateTimePickerForm: FormGroup;
  minuteOptions = [0, 15, 30, 45];
  hourOptions = [].constructor(12);

  constructor(
    private fb: FormBuilder,
    private snackbarService: SnackBarService,
    private spinnerService: SpinnerService,
    private httpService: HttpService,
    public dialogRef: MatDialogRef<CallbackComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this);
    if (this.data.allMinuteOptions) {
      this.minuteOptions = []
      for (let i = 0; i <= 59; i++) {
        this.minuteOptions.push(i);
      }
    }
    this.dateTimePickerForm = this.fb.group({
      date: [null, Validators.required],
      minute: [null, Validators.required],
      hour: [null, Validators.required],
      amPm: ["AM", Validators.required],
    });
  }

  ngOnInit() {
    if (this.data.disableDatePicker) {
      this.dateTimePickerForm.controls.date.disable();
    }
    this.dateTimePickerForm.controls.date.setValue(this.data.dateTime.toDate());
    let hour = this.data.dateTime.hours();
    let minute = this.data.dateTime.minute();
    this.dateTimePickerForm.controls.minute.setValue(this.minuteOptions.indexOf(minute) == -1 ? 0 : minute);
    this.dateTimePickerForm.controls.hour.setValue((hour > 12 ? hour - 12 : hour) || 12);
    this.dateTimePickerForm.controls.amPm.setValue(this.data.dateTime.format("A"));

  }

  setCallback() {
    let dateTime = moment(this.dateTimePickerForm.controls.date.value);
    dateTime.minutes(this.dateTimePickerForm.value.minute);
    if (this.dateTimePickerForm.value.amPm == 'AM') {
      dateTime.hours(this.dateTimePickerForm.value.hour % 12);
    } else if (this.dateTimePickerForm.value.amPm == 'PM' && this.dateTimePickerForm.value.hour <= 12) {
      dateTime.hours((this.dateTimePickerForm.value.hour + 12) % 24 || 12);
    }
    else {
      dateTime.hours(this.dateTimePickerForm.value.hour);
    }
    this.spinnerService.showSpinner = true;
    this.httpService.post(`api/leads/${this.data.lead.id}/callback/include_raw_leads=true`, { datetime: dateTime }).finally(() => {
      this.spinnerService.showSpinner = false;
    }).subscribe((rs) => {
      this.snackbarService.open("Callback Scheduled.");
      this.dialogRef.close('success');
    })
  }
}
