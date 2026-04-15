import { User } from '@app/models/user.model';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import { Task } from '@shared_models/task.model';
import { Meeting, MeetingDocument } from '@app/controllers/meeting/meeting.schema';
import { User as UserMeeting } from '@app/controllers/user/user.schema';
import { Team } from '@app/controllers/team/team.schema';
import { StatusUser } from "@shared_models/users.model";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class TelegramBotService {

    private url = 'https://api.telegram.org/bot';
    private readonly logger = new Logger(TelegramBotService.name);

    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
    ) {

    }

    async sendMessage(data: { message: string }, user: User): Promise<any> {
        const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
        const chatId = this.configService.get('TELEGRAM_CHAT_ID');
        const botId = this.configService.get('TELEGRAM_BOT_ID');

        const message = data.message + 'Автор повідомлення: ' + user.displayName + "\n\n";

        let apiUrl = `${this.url}${botId}:${token}/sendMessage?chat_id=-${chatId}&text=${message}`;
        apiUrl = encodeURI(apiUrl);
        const headersRequest = {
            'Content-Type': 'application/json'
        };

        const result = await this.httpService.get(apiUrl, { headers: headersRequest }).toPromise();
        return result && result.status == 200 ? true : false;
    }

    private async sendAnnouncementWebHook(data: { message: string }, user: User): Promise<boolean> {
        const announcementWebhook = this.configService.get('ANNOUNCEMENT_WEB_HOOK');
        if (announcementWebhook) {
            const message = data.message + 'Автор повідомлення: ' + user.displayName + "\n\n";
            const payload = { text: message };
            if (!message) {
                return;
            }
            const result = await this.httpService.post(announcementWebhook, payload).toPromise();

            return result && result.status == 200 ? true : false;
        }
    }

    async sendAnnouncementMessage(data: { message: string }, user: User): Promise<any> {
        //await this.sendMessage(data, user);
        const resultWebHook = await this.sendAnnouncementWebHook(data, user);
        return resultWebHook;
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
        const result = await this.httpService.get(apiUrl, { headers: headersRequest }).toPromise();

        return result && result.status == 200 ? true : false;
    }

    async sendReminderCron(meetings): Promise<any> {
        const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
        const botId = this.configService.get('TELEGRAM_BOT_ID');

        meetings.forEach((item) => {

            const cr = new CronJob(item.cronTime, () => {
                this.sendNotifyTelegram(item, botId, token);
            });

            cr.start();

            setTimeout(() => {
                cr.stop();
            }, 61 * 1000);
        });
    }

    private sendNotifyTelegram(meeting: Meeting, botId, token, chatIdBot?) {
        const message = this.prepareMessage(meeting);
        //this.logger.debug(`message: ${message}`);
        if (!message) {
            return;
        }
        let chatId = chatIdBot ? chatIdBot : (meeting.team as Team).teamChatId;

        let apiUrl = `${this.url}${botId}:${token}/sendMessage?chat_id=${chatId}&text=${message}`;
        apiUrl = encodeURI(apiUrl);
        const headersRequest = {
            'Content-Type': 'application/json'
        };

        this.httpService.get(apiUrl, { headers: headersRequest }).subscribe();
    }

    private sendNotifyWebHook(meeting: Meeting, webhookUrl: string, sendAll = false) {
        const requestId = Math.random().toString(36).substring(7);
        this.logger.debug(`[${requestId}] sendNotifyWebHook, sendAll: ${sendAll}`);

        if (!webhookUrl || !webhookUrl.trim()) {
            this.logger.warn(`[${requestId}] Webhook URL is missing or empty`);
            return;
        }

        const cleanUrl = webhookUrl.trim();
        const message = this.prepareMessageWebHook(meeting, sendAll);
        const payload = { text: message };

        if (!message) {
            this.logger.debug(`[${requestId}] Message is empty, skipping`);
            return;
        }

        this.logger.debug(`[${requestId}] Sending webhook to ${cleanUrl}`);
        this.logger.debug(`[${requestId}] Payload: ${JSON.stringify(payload)}`);

        this.httpService.post(cleanUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        }).subscribe({
            next: (response) => {
                this.logger.log(`[${requestId}] Webhook sent successfully: ${response.status}`);
            },
            error: (error) => {
                this.logger.error(`[${requestId}] Failed to send webhook`);
                if (error.response) {
                    this.logger.error(`[${requestId}] Status: ${error.response.status}`);
                    try {
                        this.logger.error(`[${requestId}] Data: ${JSON.stringify(error.response.data)}`);
                    } catch (e) {
                        this.logger.error(`[${requestId}] Data (raw): ${error.response.data}`);
                    }
                    try {
                        this.logger.error(`[${requestId}] Headers: ${JSON.stringify(error.response.headers)}`);
                    } catch (e) {
                        this.logger.error(`[${requestId}] Headers (raw): ${error.response.headers}`);
                    }
                } else if (error.request) {
                    this.logger.error(`[${requestId}] No response received from webhook server`);
                } else {
                    this.logger.error(`[${requestId}] Request setup error: ${error.message}`);
                }
            }
        });
    }

    async sendReminderMeetings(meetings: MeetingDocument[]): Promise<any> {
        const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
        const botId = this.configService.get('TELEGRAM_BOT_ID');

        meetings.forEach((item) => {
            this.sendNotifyTelegram(item, botId, token);
            const webHookMeeting = (item.team as Team).webHook;
            this.sendNotifyWebHook(item, webHookMeeting, true);
        });
    }

    async sendNotifyTasks(team: Team, tasks: Task[]) {
        const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
        const botId = this.configService.get('TELEGRAM_BOT_ID');
        const webHookReview = 'https://chat.googleapis.com/v1/spaces/AAQAO3xRONQ/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=Broxh3qyEaS_y9znjRBak1nseAq-LpsRym4Q66HHpUw';
        if (tasks.length) {

            const data: Meeting[] = this.parseReviewTasks(tasks, team.users);

            data.forEach((task) => {
                this.sendNotifyTelegram(task, botId, token, team.reviewChatId);
                this.sendNotifyWebHook(task, webHookReview);
            });
        }
    }

    private parseReviewTasks(tasks: Task[], users: UserMeeting[]) {

        let title = 'Задача в ревью: ' + "\n";

        const result: Meeting[] = [];

        if (tasks) {
            tasks.forEach((item: Task) => {
                let tempMeeting = { title: title + item.link + "\n" + item.summary, users: [] };
                item.reviewers.forEach((reviewer: string) => {
                    let tmpReviewer: any = { name: reviewer, telegramLogin: '', email: '', status: StatusUser.active };

                    const fUser = users.filter((item) => item.jiraLogin == reviewer);

                    if (fUser.length > 0) {
                        tmpReviewer.name = fUser[0].name;
                        const fReviewsConductediews = item.reviews_conducted.filter((elem) => elem == reviewer);
                        if (fReviewsConductediews.length == 0) {
                            tmpReviewer.telegramLogin = fUser[0].telegramLogin;
                            tmpReviewer.email = fUser[0].email;
                        } else {
                            tmpReviewer.name = tmpReviewer.name + ' ✅';
                        }
                    }
                    tempMeeting.users.push(tmpReviewer);
                });

                result.push(tempMeeting);

            });
        }

        return result;
    }

    private prepareMessageWebHook(item: Meeting, sendAll = false) {
        this.logger.debug('sendNotifyWebHook, sendAll: ' + sendAll);

        let mess = '';
        mess = mess + item.title + "\n";
        if (sendAll) {
            mess = mess + '<users/all>' + "\n";
        }
        const _users = item.users.filter(user => user.status === StatusUser.active);
        if (_users.length > 0) {
            _users.map(u => {
                mess = mess + u.name + (!sendAll && u.email ? ' @' + u.email : '') + "\n";
            });
        }

        return mess;
    }

    private prepareMessage(item: Meeting) {
        let mess = '';
        const _users = item.users.filter(user => user.status === StatusUser.active);
        if (_users.length > 0) {
            mess = item.title + "\n";
            _users.map(u => {
                mess = mess + u.name + (u.telegramLogin ? ' @' + u.telegramLogin : '') + "\n";
            });
        }

        return mess;
    }
}