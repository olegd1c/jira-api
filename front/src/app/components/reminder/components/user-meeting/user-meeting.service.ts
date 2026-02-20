import {Injectable} from '@angular/core';
import {BaseService} from '@services/base.service';
import {HttpService} from '@services/http.service';
import {IUser} from "@shared_models/users.model";

@Injectable({
  providedIn: 'root'
})
export class UserMeetingService extends BaseService {
  public urlUsers = 'users';
  public urlConfirms = 'confirms';
  public urlExecutors = 'executors';

  constructor(protected service: HttpService) {
    super(service);
  }

  public getUserMeetings(id?): Promise<any> {
    let tempUrl = this.urlUsers;
    if (id) {
      tempUrl = tempUrl + '/' + id;
    }

    this.service.setUrl(`${tempUrl}`);
    return this.service._get();
  }

  public createUserMeeting(data): Promise<any> {
    this.service.setEntity(data);
    this.service.setUrl(`${this.urlUsers}`);
    return this.service._post();
  }

  public updateUserMeeting(data): Promise<any> {
    this.service.setEntity(data);
    this.service.setUrl(`${this.urlUsers}/${data.id}`);
    return this.service._put();
  }

  public deleteUserMeeting(id): Promise<any> {
    this.service.setUrl(`${this.urlUsers}/${id}`);
    return this.service._delete();
  }

  public getConfirms(): Promise<IUser[]> {
    this.service.setUrl(`${this.urlUsers}/${this.urlConfirms}`);
    return this.service._get();
  }

  public getExecutors(): Promise<IUser[]> {
    this.service.setUrl(`${this.urlUsers}/${this.urlExecutors}`);
    return this.service._get();
  }
}
