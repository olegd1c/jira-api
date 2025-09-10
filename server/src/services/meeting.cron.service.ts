import MeetingService from '@app/controllers/meeting/meeting.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {TelegramBotService} from '@services/telegram-bot.service';

@Injectable()
export class MeetingCronService {
    private readonly logger = new Logger(MeetingCronService.name);

    constructor(
        private telegramBotService: TelegramBotService,
        private meetingService: MeetingService,
        ) {}

    @Cron("*/5 08-19 * * 1-5")
    async handleCron() {
        //this.logger.debug('MeetingCronService start');
        this.meetingService.findCurrent().then(meetings => {
            //this.logger.debug(JSON.stringify(meetings));
            this.telegramBotService.sendReminderMeetings(meetings);
            }
        ).catch(error => {
            this.logger.debug(error);
        });
    }
    
}