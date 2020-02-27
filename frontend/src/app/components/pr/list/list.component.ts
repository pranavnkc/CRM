import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HttpService, SharedDataService } from '../../../services/index';
import { AuthService } from '../../../services/auth.service';
import { SpinnerService } from '../../../services';
import { PromptDialogComponent } from '../../dialogs/prompt-dialog/prompt-dialog.component';
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
  displayedColumns = ['id', "lead_id", 'quality_status', 'submitted_by', "business_name", "phone_number", "qa_name", "qa_comment", 'agent_comment', 'created_on', 'campaign'];
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constants = constants;
  moment = moment;
  prOrHt = 0;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private dialog: MatDialog,
    public sharedDataService: SharedDataService,
    private spinnerService: SpinnerService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
  ) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd && val.url.includes('ht/')) {
        let status = val.url.split("/ht/")[1];
        this.form.controls.quality_status.setValue(status);
        this.getData();
      }
      else if (val instanceof NavigationEnd && val.url.includes('pr/')) {
        let status = val.url.split("/pr/")[1];
        this.form.controls.quality_status.setValue(status);
        this.getData();
      }
    });
    this.form = this.fb.group({
      "start_date": [moment().toDate()],
      "end_date": [moment().toDate()],
      "quality_status": [false],
      "campaign": [false],
    });
    if (this.authService.role == 'quality-analyst' || this.authService.role == 'admin') {
      this.displayedColumns[this.displayedColumns.length] = 'actions'
    }
    this.prOrHt = this.activatedRoute.snapshot.data.title == 'PR' ? 1 : 0;
  }

  ngOnInit() {
    this.paginator.page.subscribe((val) => {
      this.getData({ pageIndex: this.paginator.pageIndex, pageSize: this.paginator.pageSize });
    })
    this.sort.sortChange.subscribe((s) => {
      this.getData();
    })
    this.getData();
  }

  getData(pageConfig?: any) {
    this.spinnerService.showSpinner = true;
    let params = {
      page: pageConfig ? pageConfig.pageIndex + 1 : 1,
      include_lead: true,
      page_size: pageConfig ? pageConfig.pageSize : 20,
      start_date: moment(this.form.value.start_date).format('YYYY-MM-DD'),
      end_date: moment(this.form.value.end_date).format('YYYY-MM-DD'),
      pr: this.prOrHt,
    };
    if (this.sort.direction) {
      params['sortBy'] = this.sort.active;
      params['sortOrder'] = this.sort.direction;
    }
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
    let dialogRef = this.dialog.open(PromptDialogComponent, {
      width: "50%",
      data: { okButtonText: 'Add Comment', cancelButtonText: 'Cancel', title: 'Add Comment', message: 'Add a comment about this lead.' }
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.http.patch(`api/prospects/${prId}/change-status/`, { 'quality_status': status, 'quality_comment': data }).subscribe((res) => {
          this.getData();
        });
      }
    })
  }
}
