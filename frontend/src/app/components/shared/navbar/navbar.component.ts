import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../../../app/services';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavBarComponent { 
	role:any;
	constructor(private authService: AuthService) {
  		this.role = this.authService.role;
  	}
}
