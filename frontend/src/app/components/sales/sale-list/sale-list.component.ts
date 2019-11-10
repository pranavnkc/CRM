import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatTableDataSource, MatPaginator } from '@angular/material';
import { Router } from '@angular/router';
import { HttpService, SharedDataService } from '../../../services/index';
import { SpinnerService } from '../../../services';
import { constants } from '../../../constants';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
@Component({
  selector: 'app-sale-list',
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.css']
})
export class SaleListComponent implements OnInit {
  displayedColumns = ['id', "created_on", "date_sold", "sold_by", "quality_status", "phone_number", "busines_name", "first_name", "last_name", "current_supplier", "new_supplier", "contract_end_date", "supply_number", "renewal_acquisition"];
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constants = constants;
  moment = moment;
  constructor(private http: HttpService,
    public sharedDataService: SharedDataService,
    private spinnerService: SpinnerService,
    private router: Router, ) {
  }

  ngOnInit() {
    this.getSales();
    this.paginator.page.subscribe((val) => {
      this.getSales({ pageIndex: this.paginator.pageIndex, pageSize: this.paginator.pageSize });
    })
  }

  getSales(pageConfig?: any) {

    this.spinnerService.showSpinner = true;
    let params = {
      page: pageConfig ? pageConfig.pageIndex + 1 : 1,
      page_size: pageConfig ? pageConfig.pageSize : 20,
    };
    this.http.get('api/sales/').subscribe((res) => {
      this.spinnerService.showSpinner = false;
      this.dataSource = new MatTableDataSource(res.results);
      this.paginator.length = res.count;
      this.paginator.pageIndex = params.page - 1;
    });
  }
  edit(sale) {
    console.log(sale);
    this.router.navigate(['/sales/edit/' + sale.id, { data: JSON.stringify(sale) }]);

  }
}
