import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatPaginator } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService, SharedDataService } from '../../../services/index';
import { AuthService } from '../../../services/auth.service';
import { SpinnerService } from '../../../services';
import { constants } from '../../../constants';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class PrListComponent implements OnInit {
  form: FormGroup;
  displayedColumns = ['id', "lead_id", 'quality_status', 'submitted_by', 'created_on', 'campaign'];
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constants = constants;
  moment = moment;
  prOrHt = 0;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    public sharedDataService: SharedDataService,
    private spinnerService: SpinnerService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      "start_date": [moment().subtract('days', 7).toDate()],
      "end_date": [moment().toDate()],
      "quality_status": [false],
      "campaign": [false],
    });
    if (this.authService.role == 'quality-analyst' || this.authService.role == 'admin') {
      this.displayedColumns[this.displayedColumns.length] = 'actions'
    }
    this.prOrHt = this.activatedRoute.snapshot.data.title == 'PR' ? 1 : 0;
    this.getData();
  }

  ngOnInit() {
    this.paginator.page.subscribe((val) => {
      this.getData({ pageIndex: this.paginator.pageIndex, pageSize: this.paginator.pageSize });
    })
  }

  getData(pageConfig?: any) {
    this.spinnerService.showSpinner = true;
    let params = {
      page: pageConfig ? pageConfig.pageIndex + 1 : 1,
      page_size: pageConfig ? pageConfig.pageSize : 20,
      start_date: moment(this.form.value.start_date).format('YYYY-MM-DD'),
      end_date: moment(this.form.value.end_date).format('YYYY-MM-DD'),
      pr: this.prOrHt,
    };
    if (this.form.controls.quality_status.value) {
      params['quality_status'] = this.form.controls.quality_status.value;
    }

    if (this.form.controls.campaign.value) {
      params['campaign'] = this.form.controls.campaign.value;
    }

    this.http.get('api/prospects/', params).subscribe((res) => {
      this.spinnerService.showSpinner = false;
      this.dataSource = new MatTableDataSource(res.results);
      this.paginator.length = res.count;
      this.paginator.pageIndex = params.page - 1;
    });
  }
  changeStatus(prId, status) {
    this.http.patch(`api/prospects/${prId}/change-status/`, { 'quality_status': status }).subscribe((res) => {
      this.getData();
    });
  }
}
