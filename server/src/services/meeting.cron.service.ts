import MeetingService from '@app/controllers/meeting/meeting.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {TelegramBotService} from '@services/telegram-bot.service';
import {AppService} from "@services/app.service";

@Injectable()
export class MeetingCronService {
    private readonly logger = new Logger(MeetingCronService.name);

    constructor(
        private telegramBotService: TelegramBotService,
        private meetingService: MeetingService,
        private appService: AppService,

        ) {}

    // Секунди Хвилини Години День Місяць День_тижня
    @Cron("0 */5 08-19 * * 1-5")
    async handleCron() {
        this.meetingService.findCurrent().then(meetings => {
            const meetingsToStart = meetings.filter(m => this.appService.isItTime(m.cronTime));
            this.telegramBotService.sendReminderMeetings(meetingsToStart);
            }
        ).catch(error => {
            this.logger.debug(error);
        });
    }
    
}