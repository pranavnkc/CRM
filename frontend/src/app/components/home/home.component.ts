import { Component } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../components/users/services/user.service';
import { AuthService } from '../../services/index';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  providers: [UserService]
})
export class HomeComponent {
  form: FormGroup;
  displayedColumns = ['username', "waiting_for_audit", "approved", "hold", "rejected", 'total'];
  prDataSource = new MatTableDataSource();
  htDataSource = new MatTableDataSource();
  saleDataSource = new MatTableDataSource();
  //No use code
  loading: boolean = false;

  barChartData: Array<any> = [[27, 33, 32, 34, 48, 42, 30, 37, 23, 33, 6, 7, 9, 17, 7, 10, 10, 10, 16, 6, 9, 18, 24, 8, 11, 10, 23, 31, 22, 26]];
  barChartLabels: Array<any> = ["Fri 01", "Sat 02", "Sun 03", "Mon 04", "Tue 05", "Wed 06", "Thu 07", "Fri 08", "Sat 09", "Sun 10", "Mon 11", "Tue 12", "Wed 13", "Thu 14", "Fri 15", "Sat 16", "Sun 17", "Mon 18", "Tue 19", "Wed 20", "Thu 21", "Fri 22", "Sat 23", "Sun 24", "Mon 25", "Tue 26", "Wed 27", "Thu 28", "Fri 29", "Sat 30"];
  barChartColors = [{ backgroundColor: 'rgba(0, 156, 228, 0.80)' }]

  lineChartData: Array<any> = [[10, 30, 33, 80, 87, 101, 112]];
  lineChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  lineChartColors = [{ backgroundColor: 'rgba(0,0,0,0.0)', borderColor: 'rgba(92, 184, 92, 0.8)' }]

  versionsData: Array<any> = [[2, 1, 2, 1, 1, 8, 2, 2, 1, 1, 1, 12, 26, 8, 17, 6, 4, 54, 34]];
  versionsLabels: Array<any> = ['0.9.5.0', '1.2.0.0', '1.3.1.0', '1.4.0.0', '1.6.0.0', '1.7.0.0', '1.7.1.0', '1.8.0.0', '1.9.0.0', '1.10.0.0', '1.10.1.1', '1.11.0.0', '1.12.0.0', '1.13.0.0', '1.13.1.0', '1.13.2.0', '1.13.3.0', '1.14.0.0', '1.14.1.0'];

  pieChartData: Array<any> = [[10, 100, 154, 184, 476, 95, 133, 408, 619, 363]];
  pieChartLabels: Array<any> = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  pieChart2Data: Array<any> = [[112, 55]];
  pieChart2Labels: Array<any> = ['Active', 'Inactive'];
  pieChart2Colors: any[] = [{ backgroundColor: ['rgba(21,101,192,.8)', 'rgba(96,125,139,.7)'] }];
  pieChart3Data: Array<any> = [[95, 78]];
  pieChart3Labels: Array<any> = ['Dark', 'Light'];

  chartOptions = {
    bezierCurve: false,
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0
      }
    },
    legend: {
      display: false
    }
  };

  pieChartOptions: any = {
    cutoutPercentage: 0,
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false,
    }
  };
  dashboardData: any = {};
  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService, private userService: UserService, private fb: FormBuilder) {

    this.form = this.fb.group({
      "start_date": [moment().toDate()],
      "end_date": [moment().toDate()],
    });
    this.getData();
    console.log(this.form)
  }
  getData() {
    let params = {
      start_date: moment(this.form.value.start_date).format('YYYY-MM-DD'),
      end_date: moment(this.form.value.end_date).format('YYYY-MM-DD')
    }
    console.log(this);
    this.userService.getDashboardData(this.activatedRoute.snapshot.params.id || this.authService.user.id, params).subscribe((res) => {
      this.dashboardData = res;
      let prData = [];
      for (let u in this.dashboardData.pr) {
        prData.push({
          username: u,
          audit: this.dashboardData.pr[u]['audit'],
          approved: this.dashboardData.pr[u]['approved'],
          hold: this.dashboardData.pr[u]['on-hold'],
          rejected: this.dashboardData.pr[u]['rejected'],
        });
      }
      this.prDataSource.data = prData;
      let htData = [];
      for (let u in this.dashboardData.ht) {
        htData.push({
          username: u,
          audit: this.dashboardData.ht[u]['audit'],
          approved: this.dashboardData.ht[u]['approved'],
          hold: this.dashboardData.ht[u]['on-hold'],
          rejected: this.dashboardData.ht[u]['rejected'],
        });
      }
      this.htDataSource.data = htData;
      let saleData = [];
      for (let u in this.dashboardData.sale) {
        saleData.push({
          username: u,
          audit: this.dashboardData.sale[u]['audit'],
          approved: this.dashboardData.sale[u]['approved'],
          hold: this.dashboardData.sale[u]['on-hold'],
          rejected: this.dashboardData.sale[u]['rejected'],
        });
      }
      this.saleDataSource.data = saleData;

    })
  }
  onRefresh() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 2000);
  }

  getTotal(obj) {
    let total = 0;
    for (let k1 in obj) {
      for (let k2 in obj[k1]) {
        total += obj[k1][k2];
      }
    }
    return total;
  }
