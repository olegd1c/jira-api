import { Injectable } from '@angular/core';
//import { BaseService } from '@app/services/base.service';
//import { HttpService } from '@app/services/http.service';
import { BaseService } from './base.service';
import { HttpService } from './http.service';
import { SprintSearch } from '../models/search.modetl';

@Injectable()
export class TaskService extends BaseService {
    public url = 'tasks';

    constructor(protected service: HttpService) {
        super(service);
    }

    public getTask(params: any): Promise<any> {
        //this.setFields(param);
        this.service.setUrl(`${this.url}?rapidViewId=472&sprintsId=1639&sprintsId=1673`);
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

    public getBoards(): Promise<any> {
        this.service.setUrl(`boards?name=market`);
        return this.service._get();
    } 
}