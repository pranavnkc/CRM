import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SpinnerService, FileLoaderService } from '../../../services';
import { HttpService, SharedDataService } from '../../../services/index';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';

@Component({
  selector: 'app-pr-ht-sales-report',
  templateUrl: './pr-ht-sales-report.component.html',
  styleUrls: ['./pr-ht-sales-report.component.css']
})
export class PrHtSalesReportComponent implements OnInit {
  moment = moment;
  prOrHt = 0;
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    public sharedDataService: SharedDataService,
    private spinnerService: SpinnerService,
    private fileLoader: FileLoaderService,
  ) {
    console.log(this);
    this.form = this.fb.group({
      "start_date": [moment().subtract('days', 7).toDate()],
      "end_date": [moment().toDate()],
      "quality_status": [false],
      "campaign": [false],
    });
  }

  ngOnInit() {
  }

  getReport() {
    let report_type = this.activatedRoute.snapshot.params.report_type;
    let url = report_type == 'pr' || report_type == 'ht' ? 'api/prospects/pr-ht-report/' : '';
    this.spinnerService.showSpinner = true;
    let params = {
      start_date: moment(this.form.value.start_date).format('YYYY-MM-DD'),
      end_date: moment(this.form.value.end_date).format('YYYY-MM-DD'),
    };
    if (report_type == 'pr') {
      params["pr"] = 1;
    }

    if (report_type == 'ht') {
      params["pr"] = 0;
    }
    if (this.form.controls.quality_status.value) {
      params['quality_status'] = this.form.controls.quality_status.value;
    }

    if (this.form.controls.campaign.value) {
      params['campaign'] = this.form.controls.campaign.value;
    }

    this.http.get(url, params).subscribe((res) => {
      this.spinnerService.showSpinner = false;
      this.fileLoader.downloadFile('/' + res.file);
    });
  }
}
