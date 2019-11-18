import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
@Injectable()
export class SnackBarService {
  constructor(
    public snackBar: MatSnackBar, ) { }
  open(msg, duration?: any) {
    this.snackBar.open(msg, null, {
      duration: duration || 2000,
      horizontalPosition: "right",
      verticalPosition: "top"
    });
  }
}
