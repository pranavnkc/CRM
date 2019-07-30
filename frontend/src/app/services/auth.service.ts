import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';
import { HttpService } from '../services/http.service';
@Injectable()
export class AuthService {
  user: any;
  role: any;
  constructor(
    private router: Router,
    private http: HttpClient,
    private httpService: HttpService
  ) {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.role = localStorage.getItem('role');
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token ? true : false;
  }

  public setAuthentication(details: any) {
    this.user = details.user;
    this.role = details.role;
    localStorage.setItem('user', JSON.stringify(details.user));
    localStorage.setItem('token', details.token);
    localStorage.setItem('role', details.role);
  }
  public viewPassword(elementID) {
    document.getElementById(elementID)['type'] = document.getElementById(elementID)['type'] == 'password' ? 'text' : 'password';
  }

  public logout() {
    this.httpService.delete(`api/auth/`).subscribe((success) => {
      this.user = null;
      this.role = '';
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      this.router.navigate(['login']);
    });
  }
}



@Injectable()
export class UsernameAlreadyExistsValidator {
  public api = "api/users/validate_username/";
  public paramName = "username";
  public extraParams = {};
  constructor(private httpClient: HttpClient) {

  }
  checkUsername(control: FormControl): any {
    let params = { [this.paramName]: control.value }
    for (let extraP in this.extraParams) {
      params[extraP] = this.extraParams[extraP];

    }
    return this.httpClient.get(this.api, { params: params }).map((res) => { return null }).catch((err) => {
      return Observable.of({ [this.paramName]: err.error[this.paramName][0] })
    });

  }
}
