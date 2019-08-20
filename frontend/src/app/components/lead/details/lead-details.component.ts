import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatPaginator } from '@angular/material';
import { LeadService } from '../services';
import { SpinnerService } from '../../../services';
import { AuthService } from '../../../../app/services/auth.service';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { constants } from '../../../constants';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
@Component({
  selector: 'app-lead-details',
  templateUrl: './lead-details.component.html',
  providers: [LeadService]
})
export class LeadDetailsComponent implements OnInit {
  user: any;
  form: FormGroup;
  displayedColumns = ['created_on', 'created_by', 'comment'];
  historyDisplayedColumns = ['created_by', 'created_on', 'reason', 'past_settings', 'current_settings'];
  dataSource = new MatTableDataSource();
  historyDataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) historyPaginator: MatPaginator;
  moment = moment;
  constants = constants;
  role: any;
  constructor(private route: ActivatedRoute, private router: Router, private service: LeadService, private dialog: MatDialog,
    private authService: AuthService, private fb: FormBuilder, private spinnerService: SpinnerService) {
    this.form = this.fb.group({
      "start_date": [moment().subtract('days', 7)],
      "end_date": [moment()],
    });
  }

  ngOnInit() {
    console.log(this);
    this.role = this.authService.role;
    this.route.params.subscribe(params => {
      let id = params['id'];
      this.getUser(id);
      //this.getComments(id);
    });
    this.historyPaginator.page.subscribe((val) => {
      this.getHistoryData({ pageIndex: this.historyPaginator.pageIndex, pageSize: this.historyPaginator.pageSize });
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
    this.service.getLeadHistory(this.user.id, params).map((res: any) => {
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

  private getUser(id: any) {
    this.service.getLead(id).subscribe((data) => {
      this.user = data;
      this.getHistoryData();
    });
  }
  private getComments(id: any) {
    this.service.getComments(id).subscribe(data => this.dataSource.data = data);
  }

  onDelete(): void {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete user', message: 'Are you sure you want to delete selected user?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.service.deleteLead(this.user.id).subscribe((res) => {
        this.router.navigate([this.route.parent.url]);
      })
    });
  }
}
