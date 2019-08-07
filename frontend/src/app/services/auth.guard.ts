import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(public authService: AuthService, public router: Router, ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isAuthenticated()) {
      if (state.url == '/auth/signin') {
        this.router.navigate(['']);
      }
      if(state.url.indexOf('users')!=-1 && this.authService.role=='sales-person'){
        return false;
      }
      return true;
    }
    else {
      this.router.navigate(['login'], { queryParams: { next: state.url } });
      return false;
    }
  }

}
