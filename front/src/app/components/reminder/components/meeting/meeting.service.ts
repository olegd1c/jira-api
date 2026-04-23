import {Injectable} from '@angular/core';
import {BaseService} from '@services/base.service';
import {HttpService} from '@services/http.service';

@Injectable()
export class MeetingService extends BaseService {
  public url = 'meetings';

  constructor(protected service: HttpService) {
    super(service);
  }

  public getMeetings(id?): Promise<any> {
    let tempUrl = this.url;
    if (id) {
      tempUrl = tempUrl + '/' + id;
    }

    this.service.setUrl(`${tempUrl}`);
    return this.service._get();
  }

  public createMeeting(data): Promise<any> {
    this.service.setEntity(data);
    this.service.setUrl(`${this.url}`);
    return this.service._post();
  }

  public updateMeeting(data): Promise<any> {
    this.service.setEntity(data);
    this.service.setUrl(`${this.url}/${data.id}`);
    return this.service._put();
  }

  public deleteMeeting(id): Promise<any> {
    this.service.setUrl(`${this.url}/${id}`);
    return this.service._delete();
  }
}
