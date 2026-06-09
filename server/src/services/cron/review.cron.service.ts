import TeamService from '@app/controllers/team/team.service';
import { Task } from '@shared_models/task.model';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from '@services/notification.service';
import { JiraService } from '@services/jira.service';

@Injectable()
export class ReviewCronService {
    private readonly logger = new Logger(ReviewCronService.name);

    constructor(
        private notificationService: NotificationService,
        private teamService: TeamService,
        private jiraService: JiraService
    ) { }

    @Cron("0 0 09-18/3 * * 1-5") //0 09-18/3 * * 1-5   //*/1 * * * 1-5
    handleCron() {
        //this.logger.debug('ReviewCronService start');
        this.teamService.findForReview().then(teams => {
            teams.forEach(async team => {
                const tasks: Task[] = await this.jiraService.getTaskForReview(team.boardId);
                this.notificationService.sendNotifyTasks(team, tasks).then(() => { });
            });
        }).catch(error => {
            this.logger.debug(error);
        });
    }

    async handleCronForTeam(teamId: string) {
        const team = await this.teamService.findOneForReview(teamId);
        //this.logger.debug('ReviewCronService: ', team?.name);
        if (!team) return;
        const tasks: Task[] = await this.jiraService.getTaskForReview(team.boardId);
        //this.logger.debug('tasks: ', tasks.length);
        await this.notificationService.sendNotifyTasks(team, tasks);
    }
}