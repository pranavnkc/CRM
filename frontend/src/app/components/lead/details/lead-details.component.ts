import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { LeadService } from '../services';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-lead-details',
  templateUrl: './lead-details.component.html',
  providers: [LeadService]
})
export class LeadDetailsComponent implements OnInit {
  user: any;

  constructor(private route: ActivatedRoute, private router: Router, private service: LeadService, private dialog: MatDialog) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      let id = params['id'];
      this.getUser(id);
    });
  }

  private getUser(id: any) {
    this.service.getLead(id).subscribe(data => this.user = data);
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
