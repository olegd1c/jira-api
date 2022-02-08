import {Injectable} from '@angular/core';
import {BaseService} from '@services/base.service';
import {HttpService} from '@services/http.service';

@Injectable()
export class UserMeetingService extends BaseService {
  public urlUsers = 'users';

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
}
