import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormControlName } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      'username': [null, Validators.required],
      'password': [null, Validators.required],
    })
  }
  login() {
    this.http.post('api/auth/', this.loginForm.value).subscribe((res) => {
      this.authService.setAuthentication(res);
      this.router.navigate(['home']);
    }, (error) => {

    })
  }
}
