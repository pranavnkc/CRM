import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { LeadService } from '../services';
import { AuthService } from '../../../../app/services/auth.service';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import * as moment from 'moment';
@Component({
  selector: 'app-lead-details',
  templateUrl: './lead-details.component.html',
  providers: [LeadService]
})
export class LeadDetailsComponent implements OnInit {
  user: any;
  displayedColumns = ['created_on', 'created_by', 'comment'];
  dataSource = new MatTableDataSource();
  moment = moment;
  role:any;
  constructor(private route: ActivatedRoute, private router: Router, private service: LeadService, private dialog: MatDialog,
    private authService:AuthService) { }

  ngOnInit() {
    console.log(this);
    this.role = this.authService.role;
    this.route.params.subscribe(params => {
      let id = params['id'];
      this.getUser(id);
      this.getComments(id);
    });
  }

  private getUser(id: any) {
    this.service.getLead(id).subscribe(data => this.user = data);
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
