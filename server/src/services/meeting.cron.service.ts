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
        //this.logger.debug('MeetingCronService when the current second is 1');
        const meetings = await this.meetingService.findCurrent();
        //this.logger.debug(JSON.stringify(meetings));
        this.telegramBotService.sendReminderMeetings(meetings).then(r => {});
    }
    
}