import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpService, SpinnerService, SnackBarService, FileLoaderService } from '../../../services'

@Component({
  selector: 'app-lead-bulk-create',
  templateUrl: './lead-bulk-create.component.html',
  styleUrls: ['./lead-bulk-create.component.css']
})
export class LeadBulkCreateComponent implements OnInit {
  @ViewChild("fileInput", { read: ElementRef }) fileInput: ElementRef;
  officersUploaderror: any;
  source: any;
  constructor(
    private http: HttpService,
    private spinnerService: SpinnerService,
    private snackBarService: SnackBarService,
    private fileLoader: FileLoaderService,
  ) {
  }

  ngOnInit() {
  }

  addMultipleOfficers() {
    let formData = new FormData();
    console.log(this.source);
    if (!this.fileInput.nativeElement.files.length) {
      return;
    }
    if (!this.source) {
      return
    }
    let file = this.fileInput.nativeElement.files[0];
    formData.append('file', file, file.name);
    formData.append('source', this.source);
    let successMsg = "Officer's Added Succesfully";
    this.spinnerService.showSpinner = true;
    this.http.post('api/leads/bulk-create/', formData).subscribe((response: any) => {
      this.spinnerService.showSpinner = false;
      this.officersUploaderror = null;
      this.snackBarService.open(successMsg);
    }, (error) => {
      if (error.error.data_error) {
        this.fileLoader.downloadFile('/' + error.error.data_error[0]);
        this.officersUploaderror = "One or more rows has an error, please check the downloaded file for more details and upload again after correcting the errors."
      }
      this.officersUploaderror = error.error['file'] || error.error['lead_hash'];
    });

  };


}
