import {Injectable} from '@angular/core';
import {BaseService} from '@services/base.service';
import {HttpService} from '@services/http.service';

@Injectable()
export class TeamService extends BaseService {
  public url = 'teams';

  constructor(protected service: HttpService) {
    super(service);
  }

  public getTeams(id?): Promise<any> {
    let tempUrl = this.url;
    if (id) {
      tempUrl = tempUrl + '/' + id;
    }

    this.service.setUrl(`${tempUrl}`);
    return this.service._get();
  }

  public createTeam(data): Promise<any> {
    this.service.setEntity(data);
    this.service.setUrl(`${this.url}`);
    return this.service._post();
  }

  public updateTeam(data): Promise<any> {
    this.service.setEntity(data);
    this.service.setUrl(`${this.url}/${data.id}`);
    return this.service._put();
  }

  public deleteTeam(id): Promise<any> {
    this.service.setUrl(`${this.url}/${id}`);
    return this.service._delete();
  }
}
