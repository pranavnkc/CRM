import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatPaginator } from '@angular/material';
import { HttpService, SpinnerService } from '../../services';
import { SharedDataService } from '../../../app/services/sharedData.service';
import { UserService } from '../users/services/index';
import { constants } from '../../constants';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';

@Component({
  selector: 'app-reports',
  providers: [UserService],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  form: FormGroup;
  historyDisplayedColumns = ['lead', 'created_by', 'created_on', 'reason', 'past_settings', 'current_settings'];
  dataSource = new MatTableDataSource();
  historyDataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) historyPaginator: MatPaginator;
  moment = moment;
  constants = constants;
  users = [];
  constructor(private fb: FormBuilder, private spinnerService: SpinnerService, private http: HttpService, private userService: UserService, public sharedDataService: SharedDataService) {
    this.getUSers();
    this.form = this.fb.group({
      "start_date": [moment().subtract('days', 7)],
      "end_date": [moment()],
      "user": [false],
      "action": [false],
      "q": [null],
    });
  }

  ngOnInit() {

    this.getHistoryData();
    this.historyPaginator.page.subscribe((val) => {
      this.getHistoryData({ pageIndex: this.historyPaginator.pageIndex, pageSize: this.historyPaginator.pageSize });
    })
    this.form.controls.q.valueChanges.subscribe((val) => {
      this.getHistoryData({
        'pageIndex': 0, pageSize: this.historyPaginator.pageSize
      })
    });
  }
  getUSers() {
    this.userService.getUsers({}).subscribe((res) => {
      this.users = res.results;
    })
  }
  getHistoryData(pageConfig?: any) {
    this.spinnerService.showSpinner = true;
    console.log(this.form.value);
    let params = {
      page: pageConfig ? pageConfig.pageIndex + 1 : 1,
      page_size: pageConfig ? pageConfig.pageSize : 20,
      start_date: momentTimezone.tz(moment(this.form.value.start_date).format('YYYY-MM-DD 00:00:01ZZ'), 'UTC').format('YYYY-MM-DD HH:mm:ss'),
      end_date: momentTimezone.tz(moment(this.form.value.end_date).format('YYYY-MM-DD 23:29:59ZZ'), 'UTC').format('YYYY-MM-DD HH:mm:ss')
    };
    if (this.form.value.user) {
      params['created_by'] = this.form.value.user;
    }
    if (this.form.value.action) {
      params['action'] = this.form.value.action;
    }

    if (this.form.controls.q.value) {
      params['q'] = this.form.controls.q.value;
    }

    this.http.get(`api/reports/`, params).map((res: any) => {
      for (let row of res.results) {
        for (let key in row.old_instance_meta || []) {
          if (typeof (row.old_instance_meta[key]) == 'boolean') {
            row.old_instance_meta[key] = row.old_instance_meta[key] ? "Yes" : "No";
            row.new_instance_meta[key] = row.new_instance_meta[key] ? "Yes" : "No";
          }
        }
      }
      return res;
    }).subscribe((res: any) => {
      this.spinnerService.showSpinner = false;
      this.historyDataSource = new MatTableDataSource(res.results);
      this.historyPaginator.length = res.count;
      this.historyPaginator.pageIndex = params.page - 1;
    })
  }
}
