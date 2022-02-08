import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {TelegramBotService} from '@services/telegram-bot.service';

@Injectable()
export class ReviewCronService {
    private readonly logger = new Logger(ReviewCronService.name);

    constructor(private telegramBotService: TelegramBotService) {}

    @Cron("0 09-18/3 * * 1-5") //0 09-18/3 * * 1-5   //*/1 * * * 1-5
    handleCron() {
        //this.logger.debug('ReviewCronService when the current second is 1');

        this.telegramBotService.sendReminderReview().then(r => {});
    }
    
}