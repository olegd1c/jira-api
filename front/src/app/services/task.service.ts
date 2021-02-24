import { Injectable } from '@angular/core';
//import { BaseService } from '@app/services/base.service';
//import { HttpService } from '@app/services/http.service';
import { BaseService } from '@services/base.service';
import { HttpService } from '@services/http.service';
import { SprintSearch } from '@models/search.model';
import {Observable} from "rxjs";

@Injectable()
export class TaskService extends BaseService {
    public url = 'tasks';

    constructor(protected service: HttpService) {
        super(service);
    }

    public getTasks(params: {boardId: number, sprints: number[]}): Promise<any> {
      let queryParams = 'boardId='+params.boardId;
      params.sprints.map(item => {
        queryParams = queryParams + '&sprintsId='+item;
      });

      this.service.setUrl(`${this.url}?${queryParams}`);
      return this.service._get();
    }

    public getPoints(params: {boardId: number, sprints: number[]}): Promise<any> {
        let queryParams = 'boardId='+params.boardId;
        params.sprints.map(item => {
            queryParams = queryParams + '&sprintsId='+item;
        });

        this.service.setUrl(`pointsByDev?${queryParams}`);
        return this.service._get();
    }

    public getSprints(params: SprintSearch): Promise<any> {

        let url = `sprints?boardId=${params.boardId}`;
        if (params.start) {
            url = url + `&start=${params.start}`;
        }
        if (params.pageSize) {
            url = url + `&pageSize=${params.pageSize}`;
        }
        this.service.setUrl(url);
        return this.service._get();
    }

    public getBoards(name: string): Observable<any> {
        this.service.setUrl(`boards?name=${name}`);
        return this.service._getObserv();
    }

    public getTaskAnnouncement(params: {number: string}): Promise<any> {
        this.service.setUrl(`task-announcement/${params.number}`);
        return this.service._get();
    }

    public sendAnnouncement(data: {message: string}): Promise<any> {
        this.service.setEntity(data);
        this.service.setUrl(`send-announcement`);
        return this.service._post();
    }

    public updateStoryPoints(data: {boardId: string, keys?: string[]}): Promise<any> {
        this.service.setEntity(data);
        this.service.setUrl(`update-story-points`);
        return this.service._post();
    }
}
