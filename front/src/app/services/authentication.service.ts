import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from './base.service';
import { HttpService } from './http.service';
import { LocalStorageHelper } from '../helpers/localStorage.helper';
import { User } from '../components/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthenticationService extends BaseService {
  public url = 'auth';
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  
  constructor(protected service: HttpService) {
    super(service);
    this.currentUserSubject = new BehaviorSubject<User>(this.getCurrentUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public login(username, password): any {
    this.service.setUrl(`${this.url}/signin`);
    this.service.setEntity({ username: username, password: password });
    return this.service._post()
      .then(res => {
        let result;
        if (res && res.accessToken) {
          this.writeAuthData(res);
          this.currentUserSubject.next({username: res.username});
          result = true;
        }

        return result;
      });
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('authData');
    localStorage.removeItem('authData_time');
    this.currentUserSubject.next(null);
  }

  private writeAuthData(res: any) {
    LocalStorageHelper.setStorageForATime('authData', JSON.stringify(res));
  }

  private getCurrentUser() {
    let result = '';
    let data = localStorage.getItem('authData');
    if (data) {
      const dataParse = JSON.parse(data);
      result = dataParse.username;
    }
    
    return {username: result};
  }
}