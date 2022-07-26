import MeetingService from '@app/controllers/meeting/meeting.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TelegramBotService } from './telegram-bot.service';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        private telegramBotService: TelegramBotService,
        private meetingService: MeetingService,
        ) {

    }

    @Cron("0 */1 * * * *")
    async handleCron() {
        //this.logger.debug('Called when the current second is 1');
        const meetings = await this.meetingService.findCurrent();
        this.telegramBotService.sendReminderCron(meetings);
    }
    
}