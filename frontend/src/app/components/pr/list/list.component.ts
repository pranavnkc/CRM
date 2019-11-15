import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatTableDataSource, MatPaginator } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService, SharedDataService } from '../../../services/index';
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
  displayedColumns = ['id', "lead_id", 'quality_status', 'submitted_by', 'created_on', 'campaign'];
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constants = constants;
  moment = moment;
  prOrHt = 0;
  constructor(
    private http: HttpService,
    public sharedDataService: SharedDataService,
    private spinnerService: SpinnerService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
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
      pr: this.prOrHt,
    };
    this.http.get('api/prospects/', params).subscribe((res) => {
      this.spinnerService.showSpinner = false;
      this.dataSource = new MatTableDataSource(res.results);
      this.paginator.length = res.count;
      this.paginator.pageIndex = params.page - 1;
    });
  }
}
