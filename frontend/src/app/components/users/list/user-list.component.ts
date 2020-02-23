import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { UserService } from '../services';
import { constants } from '../../../../app/constants'
import { SpinnerService, SharedDataService } from '../../../services';
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  providers: [UserService]
})
export class UserListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  private allUsersChecked: boolean = false;
  users: Array<any>;
  isAdvancedSearchEnabled: boolean = false;
  email: string;
  startDate: Date = null;
  endDate: Date = null;
  state: string;
  constants = constants;
  displayedColumns = ['select', 'id', 'name', 'username', 'campaign', 'phone_number', 'role', 'actions'];
  dataSource = new MatTableDataSource();
  selection = new SelectionModel<any>(true, []);
  constructor(private service: UserService, private spinnerService: SpinnerService, public sharedDataService: SharedDataService) { }

  ngOnInit() {
    console.log(this);
    this.loadUsers();
    this.paginator.page.subscribe((pageConfig) => {
      this.loadUsers();
    })
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => {
        this.selection.select(row)
      });
  }
  private loadUsers(pageIndex?: any): void {
    this.spinnerService.showSpinner = true;
    this.service.getUsers({ 'page': this.paginator.pageIndex + 1, 'page_size': this.paginator.pageSize || this.constants.defaultPageSize }).finally(() => {
      this.spinnerService.showSpinner = false;
    }).subscribe((data) => {
      this.dataSource.data = data['results'];
      this.paginator.length = data["count"];
      this.paginator.pageIndex = pageIndex == undefined ? this.paginator.pageIndex : pageIndex || 0;
    });
  }

  onRefresh() {
    this.users = null;
    this.loadUsers();
  }

  checkAll() {
    this.allUsersChecked = !this.allUsersChecked;
    for (let i in this.users) {
      this.users[i].selected = this.allUsersChecked;
    }
  }
  forceLogout(userID) {
    this.service.forceLogout(userID).subscribe((res) => {

    });
  }
}
