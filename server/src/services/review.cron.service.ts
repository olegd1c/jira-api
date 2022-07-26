import TeamService from '@app/controllers/team/team.service';
import {Task} from '@shared_models/task.model';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {TelegramBotService} from '@services/telegram-bot.service';
import { JiraService } from './jira.service';

@Injectable()
export class ReviewCronService {
    private readonly logger = new Logger(ReviewCronService.name);

    constructor(
        private telegramBotService: TelegramBotService,
        private teamService: TeamService,
        private jiraService: JiraService
        ) {}

    @Cron("0 09-18/3 * * 1-5") //0 09-18/3 * * 1-5   //*/1 * * * 1-5
    handleCron() {
        //this.logger.debug('ReviewCronService when the current second is 1');
        this.teamService.findForReview().then(teams => {
            teams.forEach(async team => {
                const tasks: Task[] = await this.jiraService.getTaskForReview(team.boardId);
                this.telegramBotService.sendNotifyTasks(team, tasks).then(r => {});
            });
        });
    }
}