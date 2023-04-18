import {Injectable, UnauthorizedException} from '@nestjs/common';
import * as JiraApi from "jira-client"
import { ConfigService } from '@nestjs/config';
import { Task, Analytics, Assignee, PointAvg, TaskAnnouncement } from '@shared_models/task.model';
import {Sprint, StateSprint} from '@shared_models/sprint.model';
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

                Object.keys(issue.fields).forEach(item => {
                    fields.push(item + ': ' + issue.fields[item]);
                }
                );

                let result = {};
                if (issue) {
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
                    const pointStory = issue.fields[FieldTask.pointStory];
                    const link = getLinkTask(key);

                    const summary = issue.fields[FieldTask.summary];
                    const comment = issue.fields[FieldTask.comment];
                    const reviews_conducted = [];
                    if (comment && comment.comments && comment.comments.length) {
                        comment.comments.forEach(element => {
                            ['review+', 'review +', 'ревью+', 'ревью +'].map(elemR => {
                                if (element.body.includes(elemR)
                                    && element.author) 
                                    {
                                    reviews_conducted.push(element.author.name);
                            }
                            })
                        });
                    }

                    result = { devName: devName, pointDev: pointDev, testName: testName,
                        pointTest: pointTest, sprintName: sprintName, sprintsName: sprintsName,
                        pointStory: pointStory, link: link, summary: summary, reviews_conducted: reviews_conducted };
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
        let start: number, pageSize: number, boardId: string, state: StateSprint;
        //console.log('getAllSprints', params);
        
        start = (params.start) ? params.start : 0;
        pageSize = (params.pageSize) ? params.pageSize : 50;
        boardId = (params.boardId) ? params.boardId : '';
        state = (params.state) ? params.state : undefined;

        return jiraApi.getAllSprints(boardId, start, pageSize, state).then(result => {

            //console.log('getAllSprints: ' + JSON.stringify(result));
            let items: Sprint[] = [];
            result.values.forEach(item => {
                items.push({id: item.id, name: item.name, state: item.state, startDate: item.startDate, endDate: item.endDate, completeDate: item.completeDate});
            });

            sortList(items);

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
            }).catch(function (err) {
                console.error(err);
            });
    }

    async getPointByDev(query): Promise<any> {
        const tasks: Task[] = await this.getAllTasks(query);
        var { temp, devAvg, testAvg, reviewerAvg }: { temp, devAvg, testAvg, reviewerAvg} = this.parsePointTasks(tasks);

        const result: Analytics = {sprints: temp, sprintsAvg: {dev: devAvg, test: testAvg, reviewer: reviewerAvg}};

        return result;
    }

    async getTaskForReview(boardId: number): Promise<any> {

        if (!jiraApi) {
            const result = await this.initJiraApiBot();

            if (!result) {
                throw new UnauthorizedException('Invalid credentials');
            }
        }

        const strints = await this.getAllSprints({boardId: boardId, state: StateSprint.active});
        const sprintId = strints.values[0]['id'];
        const params = {boardId, sprintsId: [sprintId], statusesTask: ['ForReview', 'InReview']};
        const tasks: Task[] = await this.getAllTasks(params);

        return tasks;
    }

    async getTaskForBuild(params: {boardId: number}): Promise<any> {

        if (!jiraApi) {
            const result = await this.initJiraApiBot();

            if (!result) {
                throw new UnauthorizedException('Invalid credentials');
            }
        }
        let tasks: Task[];
        const sprints = await this.getAllSprints({boardId: params.boardId, state: StateSprint.active});
        if (sprints && sprints.values && sprints.values.length) {
            let paramSprints = [];
            sprints.values.map( item => {paramSprints.push(item.id)});
            const paramsTasks = {boardId: params.boardId, sprintsId: paramSprints, statusesTask: ['ForBuild', 'InBuild', 'ReleaseTesting', 'ReleaseTested']};
            tasks = await this.getAllTasks(paramsTasks, true);
        }
        sortList(tasks,'release');
        return tasks;
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

        [devAvg, testAvg, reviewerAvg].map(avg => {
            sortList(avg);
        });

        [devAvg, testAvg].map(avg => {
            countAvg(avg, true);
        });
        countAvg(reviewerAvg);
        return { temp, devAvg, testAvg, reviewerAvg };
    }

    async getAllTasks(query, announcement = false): Promise<any> {
        const boardId = query.boardId;
        const sprintId = query.sprintId;
        const sprintsId = query.sprintsId;
        const keys = query.keys;
        const statusesTask = query.statusesTask;

        if (sprintsId || keys) {

            let sprintIds = '';
            let keyIds = '';
            let statusTask = '';

            if (sprintsId && typeof sprintsId !== 'string' && sprintsId.length > 0) {
                sprintIds = sprintsId.toString();
            } else {
                sprintIds = sprintsId;
            }

            if (keys && typeof keys !== 'string' && keys.length > 0) {
                keyIds = keys.toString();
            } else {
                keyIds = keys;
            }

            if (statusesTask && statusesTask.length > 0) {
                statusTask = statusesTask.toString();
            }

            let jql = '';

            if (statusTask) {
                jql = `status in (${statusTask})`;
            }

            if (sprintIds) {
                if (jql) {
                    jql = jql + ' AND ';
                }

                jql = jql + `type in (Task, Bug, Story) AND Sprint in (${sprintIds}) ORDER BY Sprint ASC`;
            } else if (keyIds) {
                jql =  `issuekey in (${keyIds})`;
            }
            const fields = 'key';
            return jiraApi.getIssuesForBoard(boardId, 0, 1000, jql).then(async result => {

                const items: any[] = await this.parseTasks(result.issues, announcement);
                return items;
            })
                .catch(function (err) {
                    console.error(err);
                });
        } else {
            return jiraApi.getSprintIssues(boardId, sprintId).then(async result => {
                    const items = await this.parseTasks(result.contents.completedIssues);

                    return items;
                }).catch(function (err) {
                        console.error(err);
                });
        }
    }

    private async parseTasks(result: any, announcement = false): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let items = [];
            let i = 1;

            await Promise.all(result.map(async (item) => {
                let result;

                if (announcement) {
                    result = await this.getIssueAnnouncement(item.key);
                } else {
                    const data = await this.getIssue(item.key);
                    const reviewers = [];
                    if (item.fields[FieldTask.reviewer]) {
                        item.fields[FieldTask.reviewer].forEach(element => {
                            reviewers.push(element.key);
                        });
                    }
                    result = Object.assign({ id: item.id, key: item.key, summary: item.summary, reviewers: reviewers }, data);
                }
                items.push(result);
                i++;
            }));
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

                let result: TaskAnnouncement = null;
                if (issue) {

                    const dev = issue.fields['assignee'];
                    const devName = (dev) ? dev.displayName : '';

                    const fieldTest = issue.fields[FieldTask.tester];
                    const summary = issue.fields['summary'];
                    let release = '';
                    if ((issue.fields[FieldTask.fixVersions] && issue.fields[FieldTask.fixVersions].length)) {
                        issue.fields[FieldTask.fixVersions].map(item => {
                            release = release + item.name + ';';
                            });
                    }

                    const key = issue['key'];
                    const link = getLinkTask(key);

                    const testName = (fieldTest) ? fieldTest[0].displayName : '';

                    const issuelinks = issue.fields['issuelinks'];
                    let links = '';
                    let info = '';
                    const findLabelMarket = issue.fields['labels'].filter(l => l == 'common_affected_market');
                    const findLabelRest = issue.fields['labels'].filter(l => l == 'common_affected_rest');
                    if (findLabelMarket.length > 0 || findLabelRest.length > 0) {
                        info = '!!! Зміни в Common зачіпають';
                        if (findLabelMarket.length > 0) {
                            info = info + ' Market,';
                        }
                        if (findLabelRest.length > 0) {
                            info = info + ' Rest,';
                        }
                        info = info.substring(0, info.length - 1);
                    }
                    
                    
                    if (issuelinks) {
                        issuelinks.map(t => {
                            if (t.inwardIssue) {
                                links = links + t.inwardIssue.key + ';';
                            }
                        });
                    }    

                    result = { devName: devName, testName: testName, summary: summary, link: link, key: key, links: links, release: release, info: info};
                } else {
                    console.log('не найден: ' + key);
                }

                return result;

            })
            .catch(function (err) {
                console.error(err);
            });

    }

    async updateStoryPoints(data: {boardId: string, keys: string[]}): Promise<any> {
        
        const tasks: Task[] = await this.getAllTasks(data);

        await tasks.map(async data => {
            let result = await jiraApi.findIssue(data.key)
                .then(async function (issue) {
                    let result = {};
                    if (issue) {

                        let fields = [];
                        Object.keys(issue.fields).forEach(item => {
                                fields.push(item + ': ' + issue.fields[item]);
                            }
                        );

                        const fieldPointDev = issue.fields[FieldTask.pointDev];
                        const pointDev = (fieldPointDev) ? +fieldPointDev['value'] : null;
                        
                        const fieldPointTest = issue.fields[FieldTask.pointTest];
                        const pointTest = (fieldPointTest) ? +fieldPointTest['value'] : null;
                        const pointStory = issue.fields[FieldTask.pointStory];
                        if ((pointDev || pointDev == 0) 
                                && (pointTest || pointTest == 0) 
                                && (pointStory != (pointTest+pointDev))
                                ) {
                            let fieldsUpdate = {"fields": {}};
                            fieldsUpdate["fields"][FieldTask.pointStory] = pointDev + pointTest;

                            result = await jiraApi.updateIssue(data.key, fieldsUpdate);
                        }

                    } else {
                        console.log('не найден: ' + data.key);
                    }
                    return result;
                })
                .catch(function (err) {
                    console.error(err);
                });
            });
    }

    private async initJiraApiBot() {
        const username = this.configService.get<string>('JIRA_API_BOT_LOGIN');
        const password = this.configService.get<string>('JIRA_API_BOT_PASS');

        const user = {username, password};
        let result;

        try {
            result = await this.getJiraApi(user);
        } catch (e) {

        }

        return result;
    }
}

function getSprintName(fieldSprints: string[]) {
    let sprintName = '', sprintsName = [];
    if (fieldSprints) {
        fieldSprints.forEach(string => {
            const result = parseStringName(string);
            sprintName = result;
            sprintsName.push(result);
        });

    }
    return [sprintName, sprintsName.toString()];
}

function parseStringName(string: string) {
    const substring = 'name=';
    const substringEnd = ',';

    const indexStart = string.indexOf(substring);
    const indexEnd = string.substr(indexStart).indexOf(substringEnd);
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
    fItemDev.count = fItemDev.count + 1;
    fItemDev.point = fItemDev.point + ((item[d.point]) ? item[d.point] : 0);

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

function sortList(list, nameField = 'name') {
    list.sort(function(a, b){
        const nameA=a[nameField].toLowerCase(), nameB=b[nameField].toLowerCase();
        if (nameA < nameB) //sort string ascending
            return -1
        if (nameA > nameB)
            return 1
        return 0 //default return value (no sorting)
    });
}

function getLinkTask(key: string) {
    return `${apiConfig.protocol}://${apiConfig.host}/browse/${key}`;
}

