import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {TelegramBotService} from '@services/telegram-bot.service';

@Injectable()
export class MeetingCronService {
    private readonly logger = new Logger(MeetingCronService.name);

    constructor(private telegramBotService: TelegramBotService) {}

    @Cron("*/5 08-19 * * 1-5")
    handleCron() {
        //this.logger.debug('MeetingCronService when the current second is 1');
        
        this.telegramBotService.sendReminderMeetings().then(r => {});
    }
    
}