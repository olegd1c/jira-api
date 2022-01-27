import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TelegramBotService } from './telegram-bot.service';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(private telegramBotService: TelegramBotService) {

    }

    @Cron("0 */1 * * * *")
    handleCron() {
        //this.logger.debug('Called when the current second is 1');
        
        this.telegramBotService.sendReminderCron();
    }
    
}