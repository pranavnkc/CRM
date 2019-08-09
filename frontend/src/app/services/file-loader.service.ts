import { Injectable } from '@angular/core';
import { RequestOptions, ResponseContentType } from '@angular/http';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class FileLoaderService {
  isChrome: Boolean;
  isSafari: Boolean;
  constructor(private http: HttpClient) {
    this.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    this.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;
  }

  downloadFile(sUrl) {
    return this.http.get(sUrl, { responseType: 'arraybuffer' }).subscribe((res: any) => {
      //iOS devices do not support downloading. We have to inform user about this.
      if (/(iP)/g.test(navigator.userAgent)) {
        alert('Your device does not support files downloading. Please try again in desktop browser.');
        return false;
      }

      //If in Chrome or Safari - download via virtual link click
      if (this.isChrome || this.isSafari) {
        //Creating new link node.
        const link = document.createElement('a');
        link.href = sUrl;

        if (link.download !== undefined) {
          //Set HTML5 download attribute. This will prevent file from opening if supported.
          const fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
          link.download = fileName;
        }

        //Dispatching click event.
        if (document.createEvent) {
          const e = document.createEvent('MouseEvents');
          e.initEvent('click', true, true);
          link.dispatchEvent(e);
          return true;
        }
      }

      // Force file download (whether supported by server).
      if (sUrl.indexOf('?') === -1) {
        sUrl += '?download';
      }

      window.open(sUrl, '_blank');
      return true;
      // var url = res.url;
      // var link = document.createElement("a");
      // link.href = URL.createObjectURL(res.blob());
      // var fileName = url.substring(url.lastIndexOf('/') + 1, url.length);
      // link.download = fileName;
      // link.click();
    });
  }
}
