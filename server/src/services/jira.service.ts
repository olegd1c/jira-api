import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as JiraApi from "jira-client"
import { ConfigService } from '@nestjs/config';
import { Task, Analytics, Assignee, PointAvg, TaskAnnouncement } from '@shared_models/task.model';
import { Sprint, StateSprint } from '@shared_models/sprint.model';
import { User } from '@models/user.model';
import { FieldTask } from '@models/field.model';
import { SprintPoint } from '@app/models/task.model';

let apiConfig = null;
let jiraApi: JiraApi;

@Injectable()
export class JiraService {
    private readonly logger = new Logger(JiraService.name);

    constructor(private configService: ConfigService) {
        apiConfig = {
            protocol: this.configService.get('JIRA_API_PROTOCOL'),
            host: this.configService.get('JIRA_API_HOST'),
            apiVersion: this.configService.get('JIRA_API_VERSION'),
            strictSSL: false
        };
    }

    /**
     * Перевіряє наявність jiraApi та ініціалізує бот-з'єднання при потребі
     */
    private async ensureJiraApi(): Promise<void> {
        if (!jiraApi) {
            const result = await this.initJiraApiBot();
            if (!result) {
                throw new UnauthorizedException('Invalid credentials');
            }
        }
    }

    async getIssue(key: string): Promise<any> {
        try {
            const issue = await jiraApi.findIssue(key);

            if (!issue) {
                this.logger.warn(`Задачу не знайдено: ${key}`);
                return {};
            }

            const dev = issue.fields['assignee'];
            const devName = dev?.name ?? '';
            const fieldPointDev = issue.fields[FieldTask.pointDev];
            const pointDev = fieldPointDev ? +fieldPointDev['value'] : 0;
            const fieldTest = issue.fields[FieldTask.tester];
            const [sprintName, sprintsName] = getSprintName(issue.fields[FieldTask.sprints]);

            const testName = fieldTest?.[0]?.name ?? '';
            const fieldPointTest = issue.fields[FieldTask.pointTest];
            const pointTest = fieldPointTest ? +fieldPointTest['value'] : 0;
            const pointStory = issue.fields[FieldTask.pointStory];
            const link = getLinkTask(key);

            const summary = issue.fields[FieldTask.summary];
            const comment = issue.fields[FieldTask.comment];
            const reviews_conducted = [];
            if (comment?.comments?.length) {
                const reviewPatterns = ["review+", "review +", "ревью+", "ревью +"];
                comment.comments.forEach(element => {
                    reviewPatterns.forEach(pattern => {
                        if (element.body.includes(pattern) && element.author) {
                            reviews_conducted.push(element.author.name);
                        }
                    });
                });
            }

            const actualTimeDev_raw = issue.fields[FieldTask.actualTimeDev];
            const actualTimeDev = actualTimeDev_raw ? +actualTimeDev_raw : 0;

            return {
                devName, pointDev, testName, pointTest,
                sprintName, sprintsName, pointStory, link,
                summary, reviews_conducted, actualTimeDev
            };
        } catch (err) {
            this.logger.error(`Помилка отримання задачі ${key}: ${err.message}`);
            return {};
        }
    }

    async getAllSprints(params, user?: User): Promise<any> {
        const start = params.start ?? 0;
        const pageSize = params.pageSize ?? 50;
        const boardId = params.boardId ?? '';
        const state = params.state ?? undefined;

        try {
            const result = await jiraApi.getAllSprints(boardId, start, pageSize, state);

            const items: Sprint[] = result.values.map(item => ({
                id: item.id, name: item.name, state: item.state,
                startDate: item.startDate, endDate: item.endDate, completeDate: item.completeDate
            }));

            sortList(items);

            return { meta: { isLast: result.isLast, start: result.startAt, pageSize: result.maxResults }, values: items };
        } catch (err) {
            this.logger.error(`Помилка отримання спринтів: ${err.message}`);
        }
    }

    async getAllSprintsReversed(params, user?: User): Promise<any[]> {
        let isLast = false;
        const allSprints: any[] = [];

        const start_init = params.start ?? 0;
        const pageSize = params.pageSize ?? 50;
        const boardId = params.boardId ?? '';
        const state = params.state ?? undefined;
        let start = start_init;

        while (!isLast) {
            const res = await jiraApi.getAllSprints(boardId, start, pageSize, state);

            allSprints.push(...res.values);

            isLast = res.isLast || (start + pageSize >= res.total);
            start += pageSize;
        }

        // повертаємо у зворотному порядку (нові спочатку)
        return allSprints.sort((a, b) => b.id - a.id);
    }

    async getAllBoards(params): Promise<any> {
        const start = params.start ?? 0;
        const pageSize = params.pageSize ?? 50;
        const name = params.name ?? '';

        try {
            const result = await jiraApi.getAllBoards(start, pageSize, null, name);
            return result.values.map(item => ({ id: item.id, name: item.name }));
        } catch (err) {
            this.logger.error(`Помилка отримання бордів: ${err.message}`);
        }
    }

    async getPointByDev(query): Promise<any> {
        const tasks: Task[] = await this.getAllTasks(query);
        const { temp, devAvg, testAvg, reviewerAvg } = this.parsePointTasks(tasks);

        const result: Analytics = { sprints: temp, sprintsAvg: { dev: devAvg, test: testAvg, reviewer: reviewerAvg } };

        return result;
    }

    async getTaskForReview(boardId?: number): Promise<any> {
        await this.ensureJiraApi();

        if (!boardId) {
            return [];
        }

        const sprints = await this.getAllSprints({ boardId, state: StateSprint.active });
        if (sprints?.values?.length) {
            const sprintId = sprints.values[0]['id'];
            const params = { boardId, sprintsId: [sprintId], statusesTask: ['ForReview', 'InReview'] };

            return await this.getAllTasks(params);
        }

        return [];
    }

    async getTaskForBuild(params: { boardId: number }): Promise<any> {
        await this.ensureJiraApi();

        let tasks: Task[];
        const sprints = await this.getAllSprints({ boardId: params.boardId, state: StateSprint.active });
        if (sprints?.values?.length) {
            const paramSprints = sprints.values.map(item => item.id);
            const paramsTasks = { boardId: params.boardId, sprintsId: paramSprints, statusesTask: ['ForBuild', 'InBuild', 'ReleaseTesting', 'ReleaseTested'] };
            tasks = await this.getAllTasks(paramsTasks, true);
        }
        sortList(tasks, 'release');
        return tasks;
    }

    async getTaskMissingTimeTracking(boardId?: number): Promise<Task[]> {
        await this.ensureJiraApi();

        if (!boardId) {
            return [];
        }

        const sprints = await this.getAllSprints({ boardId, state: StateSprint.active });
        if (sprints?.values?.length) {
            const sprintId = sprints.values[0]['id'];
            const params = {
                boardId,
                sprintsId: [sprintId],
                statusesTask: ['Done', 'Closed', 'Resolved', 'ForBuild', 'ReleaseTesting', 'ReleaseTested']
            };
            const allTasks: Task[] = await this.getAllTasks(params);

            // Фільтруємо задачі без проставленого кастомного часу "Фактическое время в часах, разработка"
            return allTasks.filter(task => !task.actualTimeDev || task.actualTimeDev === 0);
        }

        return [];
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
                const findex = temp.findIndex(t => t.name == item.sprintName);
                if (findex >= 0) {
                    fItem = temp[findex];
                } else {
                    fItem = { name: item.sprintName, values: [] };
                    insertSprint = true;
                }

                const devs = [
                    { name: 'devName', point: 'pointDev', type: 0 },
                    { name: 'testName', point: 'pointTest', type: 1 },
                ];
                devs.forEach(d => {
                    parseAssingPoint(fItem, fItemDev, item, d);
                });
                const d = { name: 'devName', point: 'pointDev', type: 2 };
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
                const tempAvg = (item.type === 0) ? devAvg : ((item.type === 2) ? reviewerAvg : testAvg);
                const fIndex = tempAvg.findIndex(t => t.name == item.name);
                if (fIndex >= 0) {
                    fItem = tempAvg[fIndex];
                } else {
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

        [devAvg, testAvg, reviewerAvg].forEach(avg => sortList(avg));
        [devAvg, testAvg].forEach(avg => countAvg(avg, true));
        countAvg(reviewerAvg);

        return { temp, devAvg, testAvg, reviewerAvg };
    }

    async getAllTasks(query, announcement = false): Promise<any> {
        const { boardId, sprintId, sprintsId, keys, statusesTask } = query;

        if (sprintsId || keys) {
            const sprintIds = Array.isArray(sprintsId) ? sprintsId.toString() : (sprintsId || '');
            const keyIds = Array.isArray(keys) ? keys.toString() : (keys || '');
            const statusTask = statusesTask?.length ? statusesTask.toString() : '';

            let jql = '';

            if (statusTask) {
                jql = `status in (${statusTask})`;
            }

            if (sprintIds) {
                if (jql) {
                    jql += ' AND ';
                }
                jql += `type in (Task, Bug, Story) AND Sprint in (${sprintIds}) ORDER BY Sprint ASC`;
            } else if (keyIds) {
                jql = `issuekey in (${keyIds})`;
            }

            try {
                const result = await jiraApi.getIssuesForBoard(boardId, 0, 1000, jql);
                return await this.parseTasks(result.issues, announcement);
            } catch (err) {
                this.logger.error(`Помилка отримання задач: ${err.message}`);
            }
        } else {
            try {
                const result = await jiraApi.getSprintIssues(boardId, sprintId);
                return await this.parseTasks(result.contents.completedIssues);
            } catch (err) {
                this.logger.error(`Помилка отримання задач спринту: ${err.message}`);
            }
        }
    }

    private async parseTasks(issues: any[], announcement = false): Promise<any[]> {
        const items = await Promise.all(issues.map(async (item) => {
            if (announcement) {
                return await this.getIssueAnnouncement(item.key);
            }

            const data = await this.getIssue(item.key);
            const reviewers = item.fields[FieldTask.reviewer]
                ? item.fields[FieldTask.reviewer].map(element => element.key)
                : [];

            return { id: item.id, key: item.key, summary: item.summary, reviewers, ...data };
        }));

        return items;
    }

    async getJiraApi(user: User): Promise<any> {
        jiraApi = new JiraApi({
            protocol: apiConfig.protocol,
            host: apiConfig.host,
            username: user.username,
            bearer: user.token,
            apiVersion: apiConfig.apiVersion,
            strictSSL: apiConfig.strictSSL
        });

        return jiraApi.getCurrentUser();
    }

    async getIssueAnnouncement(key: string): Promise<any> {
        try {
            const issue = await jiraApi.findIssue(key);

            if (!issue) {
                this.logger.warn(`Задачу не знайдено: ${key}`);
                return null;
            }

            const dev = issue.fields['assignee'];
            const devName = dev?.displayName ?? '';

            const fieldTest = issue.fields[FieldTask.tester];
            const summary = issue.fields['summary'];
            let release = '';
            if (issue.fields[FieldTask.fixVersions]?.length) {
                release = issue.fields[FieldTask.fixVersions].map(item => item.name).join(';');
            }

            const issueKey = issue['key'];
            const link = getLinkTask(issueKey);
            const testName = fieldTest?.[0]?.displayName ?? '';

            const issuelinks = issue.fields['issuelinks'];
            let links = '';
            let info = '';
            const labels = issue.fields['labels'] || [];
            const hasMarketLabel = labels.includes('common_affected_market');
            const hasRestLabel = labels.includes('common_affected_rest');

            if (hasMarketLabel || hasRestLabel) {
                const affected = [
                    hasMarketLabel ? 'Market' : '',
                    hasRestLabel ? 'Rest' : ''
                ].filter(Boolean).join(', ');
                info = `!!! Зміни в Common зачіпають ${affected}`;
            }

            if (issuelinks) {
                links = issuelinks
                    .filter(t => t.inwardIssue)
                    .map(t => t.inwardIssue.key)
                    .join(';');
            }

            return { devName, testName, summary, link, key: issueKey, links, release, info } as TaskAnnouncement;
        } catch (err) {
            this.logger.error(`Помилка отримання анонсу ${key}: ${err.message}`);
            return null;
        }
    }

    async updateStoryPoints(data: { boardId: string, keys: string[] }): Promise<any> {
        const tasks: Task[] = await this.getAllTasks(data);

        await Promise.all(tasks.map(async (task) => {
            try {
                const issue = await jiraApi.findIssue(task.key);

                if (!issue) {
                    this.logger.warn(`Задачу не знайдено: ${task.key}`);
                    return;
                }

                const fieldPointDev = issue.fields[FieldTask.pointDev];
                const pointDev = fieldPointDev ? +fieldPointDev['value'] : null;

                const fieldPointTest = issue.fields[FieldTask.pointTest];
                const pointTest = fieldPointTest ? +fieldPointTest['value'] : null;
                const pointStory = issue.fields[FieldTask.pointStory];

                if ((pointDev || pointDev == 0)
                    && (pointTest || pointTest == 0)
                    && (pointStory != (pointTest + pointDev))
                ) {
                    const fieldsUpdate = { "fields": { [FieldTask.pointStory]: pointDev + pointTest } };
                    await jiraApi.updateIssue(task.key, fieldsUpdate);
                }
            } catch (err) {
                this.logger.error(`Помилка оновлення story points для ${task.key}: ${err.message}`);
            }
        }));
    }

    private async initJiraApiBot() {
        const username = this.configService.get<string>('JIRA_API_BOT_LOGIN');
        const token = this.configService.get<string>('JIRA_API_BOT_TOKEN');

        try {
            return await this.getJiraApi({ username, token } as User);
        } catch (e) {
            this.logger.error(`Помилка ініціалізації Jira API бота: ${e.message}`);
            return null;
        }
    }
}

function getSprintName(fieldSprints: string[]): [string, string] {
    let sprintName = '';
    const sprintsName: string[] = [];

    if (fieldSprints) {
        fieldSprints.forEach(str => {
            const result = parseStringName(str);
            sprintName = result;
            sprintsName.push(result);
        });
    }

    return [sprintName, sprintsName.toString()];
}

function parseStringName(str: string): string {
    const substring = 'name=';
    const substringEnd = ',';

    const indexStart = str.indexOf(substring);
    const rest = str.substring(indexStart);
    const indexEnd = rest.indexOf(substringEnd);
    return rest.substring(5, indexEnd);
}

function parseAssingPoint(fItem, fItemDev, item, d, nameUser = '') {
    let insertDev = false;
    if (!nameUser) {
        nameUser = item[d.name];
    }
    const fIndexDev = fItem.values.findIndex(t => t.name == nameUser && t.type == d.type);

    if (fIndexDev >= 0) {
        fItemDev = fItem.values[fIndexDev];
    } else {
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
    const total: PointAvg = { name: 'Разом', countSprint: 0, countAll: 0, pointAll: 0, countAvg: 0, pointAvg: 0 };
    avg.forEach(item => {
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
    list.sort((a, b) => {
        const nameA = a[nameField].toLowerCase();
        const nameB = b[nameField].toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });
}

function getLinkTask(key: string) {
    return `${apiConfig.protocol}://${apiConfig.host}/browse/${key}`;
}
