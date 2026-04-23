import TeamService from '@app/controllers/team/team.service';
import { Task } from '@shared_models/task.model';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from '@services/notification.service';
import { JiraService } from '@services/jira.service';

@Injectable()
export class TimeTrackingCronService {
    private readonly logger = new Logger(TimeTrackingCronService.name);

    constructor(
        private notificationService: NotificationService,
        private teamService: TeamService,
        private jiraService: JiraService
    ) { }

    // Секунди Хвилини Години День Місяць День_тижня
    //@Cron("0 */1 08-19 * * 1-5")
    @Cron("0 0 10 * * 1-5")
    handleCron() {
        //this.logger.debug('TimeTrackingCronService start');
        this.teamService.findForTimeTracking().then(teams => {
            //this.logger.debug('teams: ', teams.length);
            teams.forEach(async team => {
                try {
                    const tasks: Task[] = await this.jiraService.getTaskMissingTimeTracking(team.boardId);
                    //this.logger.debug('tasks: ', tasks.length);
                    if (tasks && tasks.length > 0) {
                        this.notificationService.sendNotifyMissingTime(team, tasks).then(() => { });
                    }
                } catch (err) {
                    this.logger.error(`Error in TimeTrackingCronService for team ${team.boardId}: ${err.message}`);
                }
            });
        }).catch(error => {
            this.logger.debug(error);
        });
    }
}
