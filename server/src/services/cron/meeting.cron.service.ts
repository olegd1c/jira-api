import MeetingService from '@app/controllers/meeting/meeting.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from '@services/notification.service';
import { AppService } from "@services/app.service";

@Injectable()
export class MeetingCronService {
    private readonly logger = new Logger(MeetingCronService.name);

    constructor(
        private notificationService: NotificationService,
        private meetingService: MeetingService,
        private appService: AppService,

    ) { }

    async handleCronForTeam(teamId: string) {
        const meetings = await this.meetingService.findActiveByTeam(teamId);
        this.notificationService.sendReminderMeetings(meetings);
    }

    // Секунди Хвилини Години День Місяць День_тижня
    @Cron("0 */5 08-19 * * 1-5")
    async handleCron() {
        this.meetingService.findCurrent().then(meetings => {
            const meetingsToStart = meetings.filter(m => this.appService.isItTime(m.cronTime));
            this.notificationService.sendReminderMeetings(meetingsToStart);
        }
        ).catch(error => {
            this.logger.debug(error);
        });
    }

}