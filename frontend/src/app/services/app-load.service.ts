import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import { constants } from '../constants';

@Injectable()
export class AppLoadService {
  constructor(private httpClient: HttpClient) { }
  loadConfigurationData(): Promise<any> {
    return this.httpClient.get('https://api6.ipify.org/?format=json')
      .do(result => {
        constants.ipAddress = result['ip'];
      })
      .toPromise();
  }
}
