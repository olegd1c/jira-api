import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from './base.service';
import { HttpService } from './http.service';
import { LocalStorageHelper } from '@app/helpers/localStorage.helper';
import { User } from '@models/user.model';

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
          this.currentUserSubject.next({username: res.username, permissions: res.permissions});
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
    let result = null;
    let data = localStorage.getItem('authData');
    if (data) {
      const dataParse = JSON.parse(data);
      result = {username: dataParse.username, permissions: dataParse.permissions};
    }

    return result;
  }

  public static getAccessToken(): string {
    let authData: any = LocalStorageHelper.getlocalStorage('authData');
    if (authData) {
      authData = JSON.parse(authData);
      if (authData.accessToken) {
        return authData.accessToken;
      }
    }
    return '';
  }

  public static getPermissions(): string[] {
    let authData: any = LocalStorageHelper.getlocalStorage('authData');
    if (authData) {
      authData = JSON.parse(authData);
      if (authData.permissions) {
        return authData.permissions;
      }
    }
    return [];
  }
}
