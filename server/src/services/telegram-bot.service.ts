import CasesService from '@app/controllers/case/case.service';
import {User} from '@app/models/user.model';
import {HttpService, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {CronJob} from 'cron';
import {Task} from '@shared_models/task.model';
import {Meeting} from '@app/controllers/meeting/meeting.schema';
import {JiraService} from '@services/jira.service';
import UserService from '@app/controllers/user/user.service';
import TeamService from '@app/controllers/team/team.service';
import MeetingService from '@app/controllers/meeting/meeting.service';
import {User as UserMeeting} from '@app/controllers/user/user.schema';
import { Team } from '@app/controllers/team/team.schema';

@Injectable()
export class TelegramBotService {

    private url = 'https://api.telegram.org/bot';

    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
        private casesService: CasesService,
        private meetingService: MeetingService,
        private jiraService: JiraService,
        private userService: UserService,
        private teamService: TeamService,
    ) {

    }

    async sendMessage(data: { message: string }, user: User): Promise<any> {
        const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
        const chatId = this.configService.get('TELEGRAM_CHAT_ID');
        const botId = this.configService.get('TELEGRAM_BOT_ID');

        const message = data.message + 'Автор сообщения: ' + user.displayName + "\n\n";

        let apiUrl = `${this.url}${botId}:${token}/sendMessage?chat_id=-${chatId}&text=${message}`;
        apiUrl = encodeURI(apiUrl);
        const headersRequest = {
            'Content-Type': 'application/json'
        };

        const result = await this.httpService.get(apiUrl, {headers: headersRequest}).toPromise();
        return result && result.status == 200 ? true : false;
    }

    async sendReminder(): Promise<any> {
        const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
        const chatId = this.configService.get('TELEGRAM_CHAT_ID_MK_FRONT');
        const botId = this.configService.get('TELEGRAM_BOT_ID');

        //const message = data.message + 'Автор сообщения: ' + user.displayName +"\n\n";
        const message = 'Стендап 10.30' + "\n\n" + '@BogusUA @olegd1c';

        let apiUrl = `${this.url}${botId}:${token}/sendMessage?chat_id=-${chatId}&text=${message}`;
        apiUrl = encodeURI(apiUrl);
        const headersRequest = {
            'Content-Type': 'application/json'
        };
        const result = await this.httpService.get(apiUrl, {headers: headersRequest}).toPromise();

        return result && result.status == 200 ? true : false;
    }

    async sendReminderCron(): Promise<any> {
        const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
        //const chatId = this.configService.get('TELEGRAM_CHAT_ID_MK_FRONT');
        const botId = this.configService.get('TELEGRAM_BOT_ID');

        //const data = await import('../data/tasks.json');
        const data = await this.meetingService.findCurrent();

        data.forEach((item) => {

            const cr = new CronJob(item.cronTime, () => {
                this.sendNotify(item, botId, token);
            });

            cr.start();

            setTimeout(() => {
                cr.stop();
            }, 61 * 1000);
        });

        //const message = data.message + 'Автор сообщения: ' + user.displayName +"\n\n";

    }

    private sendNotify(item: Meeting, botId, token, chatIdBot?) {
        const message = prepareMessage(item);
        let chatId = chatIdBot ? chatIdBot : (item.team as Team).teamChatId;

        let apiUrl = `${this.url}${botId}:${token}/sendMessage?chat_id=-${chatId}&text=${message}`;
        apiUrl = encodeURI(apiUrl);
        const headersRequest = {
            'Content-Type': 'application/json'
        };

        this.httpService.get(apiUrl, {headers: headersRequest}).subscribe();
    }

    async sendReminderMeetings(): Promise<any> {
        const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
        //const chatId = this.configService.get('TELEGRAM_CHAT_ID_MK_FRONT');
        const botId = this.configService.get('TELEGRAM_BOT_ID');

        const data = await this.meetingService.findCurrent();

        data.forEach((item) => {

            const cr = new CronJob(item.cronTime, () => {
                this.sendNotify(item, botId, token);
            });

            cr.start();

            setTimeout(() => {
                cr.stop();
            }, 61 * 1000);
        });

        //const message = data.message + 'Автор сообщения: ' + user.displayName +"\n\n";

    }

    async sendReminderReview(): Promise<any> {
        const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
        const botId = this.configService.get('TELEGRAM_BOT_ID');

        const teams = await this.teamService.findForReview();

        teams.forEach(item => {
                this.findTasks(item, botId, token);
            }
        )
        //const message = data.message + 'Автор сообщения: ' + user.displayName +"\n\n";

    }

    private async findTasks(elem: Team, botId: string, token: string) {
        const tasks: Task[] = await this.jiraService.getTaskForReview(elem.boardId);

        if (tasks.length) {

            const data: Meeting[] = this.parseReviewTasks(tasks, elem.users);

            data.forEach((item) => {
                this.sendNotify(item, botId, token, elem.reviewChatId);
            });
        }
    }

    private parseReviewTasks(tasks: Task[], users: UserMeeting[]) {

        let title = 'Задача в ревью: ' + "\n";

        const result: Meeting[] = [];

        if (tasks) {
            tasks.forEach((item: Task) => {
                let tempMeeting = {title: title + item.link + "\n" + item.summary, users: []};
                let tmpReviewer = '';
                item.reviewers.forEach((reviewer: string) => {
                    let tmpReviewer = {name: reviewer, telegramLogin: ''};
                    
                    const fUser = users.filter((item) => item.jiraLogin == reviewer);

                    if (fUser.length > 0) {
                        tmpReviewer.name = fUser[0].name;
                        const fReviewsConductediews = item.reviews_conducted.filter((elem) => elem == reviewer);
                        if (fReviewsConductediews.length == 0) {
                            tmpReviewer.telegramLogin = fUser[0].telegramLogin;
                        }
                    }
                    tempMeeting.users.push(tmpReviewer);
                });
                //tempMeeting.users.push(tmpReviewer);

                result.push(tempMeeting);

            });
        }

        return result;
    }
}

function prepareMessage(item: { title: string; users?: UserMeeting[]; }) {
    let mess = item.title + "\n";
    
    item.users && item.users.map(u => {
        mess = mess + u.name + ( u.telegramLogin ? ' @' + u.telegramLogin : '') + "\n";
    });

    return mess;
}