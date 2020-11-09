import { Injectable } from '@nestjs/common';
import * as JiraApi from "jira-client"
import { ConfigService } from '@nestjs/config';
import { Task, Analytics, Assignee, PointAvg, TaskAnnouncement } from '@shared_models/task.model';
import { User } from '@models/user.model';

import { FieldTask } from '@models/field.model';
import { SprintPoint } from '@app/models/task.model';

let apiConfig = null;
let  jiraApi: JiraApi;

@Injectable()
export class JiraService {

    constructor(private configService: ConfigService) {
        apiConfig = {
            protocol: this.configService.get('JIRA_API_PROTOCOL'),
            host: this.configService.get('JIRA_API_HOST'),
            apiVersion: this.configService.get('JIRA_API_VERSION'),
            strictSSL: false
        };
    }

    async getIssue(key: string): Promise<any> {

        return jiraApi.findIssue(key)
            .then(function (issue) {
                let fields = [];

                //console.log('Status: ' + issue.fields.status.name);
                //console.log('issue.fields: ' + JSON.stringify(issue.fields));

                Object.keys(issue.fields).forEach(item => {
                    fields.push(item + ': ' + issue.fields[item]);
                }
                );
                //customfield_10107
                let result = {};
                if (issue) {
                    console.log(JSON.stringify(issue));
                    //return JSON.stringify(issue);
                    const dev = issue.fields['assignee'];
                    const devName = (dev) ? dev.name : '';
                    const fieldPointDev = issue.fields[FieldTask.pointDev];
                    const pointDev = (fieldPointDev) ? +fieldPointDev['value'] : 0;
                    const fieldTest = issue.fields[FieldTask.tester];
                    const fieldSprints = issue.fields[FieldTask.sprints];
                    let sprintName, sprintsName;
                    [sprintName, sprintsName] = getSprintName(fieldSprints);
                    //const sprintName = this.getNameSprint(fieldSprints);

                    const testName = (fieldTest) ? fieldTest[0].name : '';
                    const fieldPointTest = issue.fields[FieldTask.pointTest];
                    const pointTest = (fieldPointTest) ? +fieldPointTest['value'] : 0;
                    //console.log('fieldSprints: '+ JSON.stringify(issue.fields));
                    result = { devName: devName, pointDev: pointDev, testName: testName, pointTest: pointTest, sprintName: sprintName, sprintsName: sprintsName };
                } else {
                    console.log('не найден: ' + key);
                }

                return result;

            })
            .catch(function (err) {
                console.error(err);
            });

    }

    async getAllSprints(params, user?: User): Promise<any> {
        //console.log(user);
        let start: number, pageSize: number, boardId: string;
        //console.log('getAllSprints', params);
        
        start = (params.start) ? params.start : 0;
        pageSize = (params.pageSize) ? params.pageSize : 50;
        boardId = (params.boardId) ? params.boardId : '';

        return jiraApi.getAllSprints(boardId, start, pageSize).then(result => {

            //console.log('getAllSprints: ' + JSON.stringify(result));
            let items = [];
            result.values.forEach(item => {
                items.push({id: item.id, name: item.name});
            })

            items.sort((a,b) => {
                if (a.name > b.name) {
                    return 1
                } else {
                    return -1
                }
            });
            return {meta:{isLast: result.isLast, start: result.startAt, pageSize: result.maxResults}, values: items};
        })
            .catch(function (err) {
                console.error(err);
            });

    }

    async getAllBoards(params): Promise<any> {
        let start: number, pageSize: number, name: string;
        start = (params.start) ? params.start : 0;
        pageSize = (params.pageSize) ? params.pageSize : 50;
        name = (params.name) ? params.name : '';

        return jiraApi.getAllBoards(start, pageSize, null, name).then(result => {

            //console.log('getAllBoards: ' + JSON.stringify(result));
            let items = [];
            result.values.forEach(item => {
                items.push({id: item.id, name: item.name});
            })

            return items;
        })
            .catch(function (err) {
                console.error(err);
            });

    }

    async getPointByDev(query): Promise<any> {
        const tasks: Task[] = await this.getAllTasks(query);
        //console.log('getPointByDev', tasks.length);
        
        var { temp, devAvg, testAvg, reviewerAvg }: { temp, devAvg, testAvg, reviewerAvg} = this.parsePointTasks(tasks);

        const result: Analytics = {sprints: temp, sprintsAvg: {dev: devAvg, test: testAvg, reviewer: reviewerAvg}};

        return result;
    }

    private parsePointTasks(tasks: Task[]) {

        const temp: SprintPoint[] = [];
        const devAvg: PointAvg[] = [];
        const testAvg: PointAvg[] = [];
        const reviewerAvg: PointAvg[] = [];

        if (tasks) {
            tasks.forEach((item: Task) => {
                let insertSprint = false;            
                let fItem: SprintPoint;
                let fItemDev: Assignee;
                let findex = temp.findIndex(t => t.name == item.sprintName
                );
                //console.log('findex', findex);
                if (findex >= 0) {
                    fItem = temp[findex];
                }
                else {
                    fItem = { name: item.sprintName, values: [] };
                    insertSprint = true;
                }
                
                const devs = [
                    {name: 'devName', point: 'pointDev', type: 0},
                    {name: 'testName', point: 'pointTest', type: 1},
                    //{name: 'reviewers', point: 'pointDev', type: 2},
                ];
                devs.map(d => {
                    parseAssingPoint(fItem, fItemDev, item, d);
                    /*
                    let insertDev = false;
                    let fIndexDev = fItem.values.findIndex(t => t.name == item[d.name]);

                    if (fIndexDev >= 0) {
                        fItemDev = fItem.values[fIndexDev];
                    }
                    else {
                        fItemDev = { name: item[d.name], count: 0, point: 0, type: d.type };
                        insertDev = true;
                    }
        
                    //console.log('fItemDev.point', fItemDev.point, 'item.pointDev', item.pointDev);
                    fItemDev.count = fItemDev.count + 1;
                    fItemDev.point = fItemDev.point + ((item[d.point]) ? item[d.point] : 0);
                    //console.log('fItemDev.pointEnd', fItemDev.point);
        
                    if (insertDev) {
                        fItem.values.push(fItemDev);
                    }
                    */
                });
                const d = {name: 'devName', point: 'pointDev', type: 2};
                item.reviewers.forEach(r => {
                    parseAssingPoint(fItem, fItemDev, item, d, r);
                });

                if (insertSprint) {
                    temp.push(fItem);
                }
            });
        }
        temp.forEach((itemS: SprintPoint) => {

            itemS.values.forEach((item: Assignee) => {
                let insertDev = false;
                let fItem: PointAvg;
                let tempAvg = (item.type === 0) ? devAvg : ((item.type === 2) ? reviewerAvg : testAvg);
                let fIndex = tempAvg.findIndex(t => t.name == item.name);
                //console.log('findex', findex);
                if (fIndex >= 0) {
                    fItem = tempAvg[fIndex];
                }
                else {
                    fItem = { name: item.name, countAll: 0, pointAll: 0, countAvg: 0, pointAvg: 0, countSprint: 0 };
                    insertDev = true;
                }

                fItem.countSprint = fItem.countSprint + 1;
                fItem.countAll = fItem.countAll + (+item.count);
                fItem.pointAll = fItem.pointAll + (+item.point);

                if (insertDev) {
                    tempAvg.push(fItem);
                }

            });
        });
        
        [devAvg, testAvg].map(avg => {
            countAvg(avg, true);
            /*
            const total: PointAvg = {name: 'Разом', countSprint: 0, countAll: 0, pointAll: 0, countAvg: 0, pointAvg: 0};
            avg.map(item => {
                item.pointAvg = (item.pointAll / item.countSprint).toFixed(1);
                item.countAvg = (item.countAll / item.countSprint).toFixed(1);

                total.countAll = total.countAll + item.countAll;
                total.pointAll = total.pointAll + item.pointAll;
                total.countAvg = (+total.countAvg) + (+item.countAvg);
                total.pointAvg = (+total.pointAvg) + (+item.pointAvg);
            });

            avg.push(total);
            */
        });
        countAvg(reviewerAvg);
        return { temp, devAvg, testAvg, reviewerAvg };
    }

    async getAllTasks(query): Promise<any> {
        const boardId = query.boardId;
        const sprintId = query.sprintId;
        const sprintsId = query.sprintsId;
        //console.log('getSprintIssues query: ' + JSON.stringify(query));
        if (sprintsId) {
            //boardId: string, startAt: number, maxResults: number, jql: string, validateQuery: boolean, fields: string
            let ids = ''
            if (typeof sprintsId !== 'string' && sprintsId.length > 0) {
                ids = sprintsId.toString();
            } else {
                ids = sprintsId;
            }
            //console.log('ids: ' + ids);
            //status = Done AND 
            const jql = `type in (Task, Bug, Story) AND Sprint in (${ids}) ORDER BY Sprint ASC`;
            const fields = 'key';
            return jiraApi.getIssuesForBoard(boardId, 0, 1000, jql).then(async result => {

                //console.log('getSprintIssues: ' + JSON.stringify(result));

                const items: any[] = await this.parseTasks(result.issues);
                //console.log('items: ' + items.length);
                //items.sort((a,b) => (a.sprintName > b.sprintName) ? 1 : 0);
                /*
                items.sort(function(a, b){
                  var nameA=a.sprintName.toLowerCase(), nameB=b.sprintName.toLowerCase()
                  if (nameA < nameB) //sort string ascending
                      return -1 
                  if (nameA > nameB)
                      return 1
                  return 0 //default return value (no sorting)
                });
                */
                return items;
            })
                .catch(function (err) {
                    console.error(err);
                });
        } else {
            return jiraApi.getSprintIssues(boardId, sprintId).then(async result => {

                //console.log('getSprintIssues: ' + JSON.stringify(result));

                const items = await this.parseTasks(result.contents.completedIssues);

                return items;
            })
                .catch(function (err) {
                    console.error(err);
                });
        }
    }

    private async parseTasks(result: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let items = [];
            let i = 1;

            await Promise.all(result.map(async (item) => {
                //console.log('parseTasks key: ' + item.key);
                //console.log('parseTask: ' + JSON.stringify(item));
                //console.log('/n');
                const data = await this.getIssue(item.key);
                const reviewers = [];
                if (item.fields[FieldTask.reviewer]) {
                    item.fields[FieldTask.reviewer].forEach(element => {
                        reviewers.push(element.key);
                    });
                }
                result = Object.assign({ id: item.id, key: item.key, summary: item.summary, reviewers: reviewers }, data);
                items.push(result);
                //console.log('data: ' + JSON.stringify(data));
                i++;
            }));

            //console.log('newMethod: ' + JSON.stringify(items));
            resolve(items);
        });
    }

    async getJiraApi(user: User): Promise<any> {

            jiraApi = new JiraApi({
                protocol: apiConfig.protocol,
                host: apiConfig.host,
                username: user.username,
                password: user.password,
                apiVersion: apiConfig.apiVersion,
                strictSSL: apiConfig.strictSSL
            });

        return jiraApi.getCurrentUser();
    }

    async getIssueAnnouncement(key: string): Promise<any> {

        return jiraApi.findIssue(key)
            .then(function (issue) {
                let fields = [];

                //console.log('Status: ' + issue.fields.status.name);
                //console.log('issue.fields: ' + JSON.stringify(issue.fields));

                //Object.keys(issue.fields).forEach(item => {
                    //fields.push(item + ': ' + issue.fields[item]);
                //}
                //);
                //customfield_10107
                let result: TaskAnnouncement = null;
                if (issue) {
                    //console.log(JSON.stringify(issue));
                    //result = JSON.stringify(issue);
                    
                    const dev = issue.fields['assignee'];
                    const devName = (dev) ? dev.displayName : '';

                    const fieldTest = issue.fields[FieldTask.tester];
                    const summary = issue.fields['summary'];
                    const key = issue['key'];
                    const link = `${apiConfig.protocol}://${apiConfig.host}/browse/${key}`;

                    const testName = (fieldTest) ? fieldTest[0].displayName : '';

                    //console.log('fieldSprints: '+ JSON.stringify(issue.fields));
                    
                    result = { devName: devName, testName: testName, summary: summary, link: link, key: key};
                } else {
                    console.log('не найден: ' + key);
                }

                return result;

            })
            .catch(function (err) {
                console.error(err);
            });

    }

}

function getSprintName(fieldSprints: string[]) {
    let sprintName = '', sprintsName = [];
    if (fieldSprints) {
        fieldSprints.forEach(string => {
            const result = parseStringName(string);
            //if (!sprintName) {
                sprintName = result;
            //}
            sprintsName.push(result);
        });

    }
    return [sprintName, sprintsName.toString()];
}

function parseStringName(string: string) {
    const substring = 'name=';
    const substringEnd = ',';

    const indexStart = string.indexOf(substring);
    //console.log('indexStart', indexStart);
    //console.log('indexStart', string.substr(indexStart));
    const indexEnd = string.substr(indexStart).indexOf(substringEnd);
    //console.log('indexEnd', indexEnd);
    const result = string.substr(indexStart + 5, indexEnd - 5);
    return result;
}

function parseAssingPoint(fItem, fItemDev, item, d, nameUser = '') {
    let insertDev = false;
    if (!nameUser) {
        nameUser = item[d.name];
    }
    let fIndexDev = fItem.values.findIndex(t => t.name == nameUser && t.type == d.type);

    if (fIndexDev >= 0) {
        fItemDev = fItem.values[fIndexDev];
    }
    else {
        fItemDev = { name: nameUser, count: 0, point: 0, type: d.type };
        insertDev = true;
    }

    //console.log('fItemDev.point', fItemDev.point, 'item.pointDev', item.pointDev);
    fItemDev.count = fItemDev.count + 1;
    fItemDev.point = fItemDev.point + ((item[d.point]) ? item[d.point] : 0);
    //console.log('fItemDev.pointEnd', fItemDev.point);

    if (insertDev) {
        fItem.values.push(fItemDev);
    }
}

function countAvg(avg, useTotal = false) {
    const total: PointAvg = {name: 'Разом', countSprint: 0, countAll: 0, pointAll: 0, countAvg: 0, pointAvg: 0};
    avg.map(item => {
        item.pointAvg = (item.pointAll / item.countSprint).toFixed(1);
        item.countAvg = (item.countAll / item.countSprint).toFixed(1);

        if (useTotal) {        
            total.countAll = total.countAll + item.countAll;
            total.pointAll = total.pointAll + item.pointAll;
            total.countAvg = (+total.countAvg) + (+item.countAvg);
            total.pointAvg = (+total.pointAvg) + (+item.pointAvg);
        }
    });

    if (useTotal) {
        avg.push(total);
    }
}

