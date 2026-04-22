import { User } from '@app/models/user.model';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import { Meeting } from '@app/controllers/meeting/meeting.schema';
import { Team } from '@app/controllers/team/team.schema';
import { HttpService } from "@nestjs/axios";
import { prepareMessage } from '../utils/notification.utils';

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

    async sendReminder(): Promise<any> {
        const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
        const chatId = this.configService.get('TELEGRAM_CHAT_ID_MK_FRONT');
        const botId = this.configService.get('TELEGRAM_BOT_ID');

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
        meetings.forEach((item) => {

            const cr = new CronJob(item.cronTime, () => {
                this.sendNotifyTelegram(item);
            });

            cr.start();

            setTimeout(() => {
                cr.stop();
            }, 61 * 1000);
        });
    }

    sendNotifyTelegram(meeting: Meeting, chatIdBot?) {
        const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
        const botId = this.configService.get('TELEGRAM_BOT_ID');

        const message = prepareMessage(meeting);
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
}