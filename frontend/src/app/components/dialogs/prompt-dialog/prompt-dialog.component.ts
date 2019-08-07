import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './prompt-dialog.component.html'
})
export class PromptDialogComponent {
  comment: String;
  form = new FormGroup({
    text: new FormControl(null, Validators.required)
  });

  constructor(public dialogRef: MatDialogRef<PromptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { console.log(this) }

  close() {
    console.log("closed");
    this.dialogRef.close(this.form.controls.text.value);
  }
}
