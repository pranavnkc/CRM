import { Injectable } from '@angular/core';
import { HttpService } from '../../../services';

@Injectable()
export class UserService {

  constructor(private http: HttpService) {
  }

  getUsers() {
    return this.http.get('api/users/');
  }

  getUser(id: any) {
    return this.http.get(`api/users/${id}/`);
  }
  updateUser(id: any, data: any) {
    return this.http.patch(`api/users/${id}/`, data);
  }
  createUser(data) {
    return this.http.post(`api/users/`, data);
  }
  deleteUser(id: any) {
    return this.http.delete(`api/users/${id}/`);
  }

}
