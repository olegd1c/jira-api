import { Injectable, Logger } from '@nestjs/common';
import { Task } from '@shared_models/task.model';
import { Team } from '@app/controllers/team/team.schema';
import { Meeting, MeetingDocument } from '@app/controllers/meeting/meeting.schema';
import { User } from '@app/models/user.model';
import { TelegramBotService } from './telegram-bot.service';
import { GoogleChatService } from './google-chat.service';
import { parseReviewTasks, parseMissingTimeTasks } from '../utils/notification.utils';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        private telegramBotService: TelegramBotService,
        private googleChatService: GoogleChatService,
    ) { }

    async sendAnnouncementMessage(data: { message: string }, user: User): Promise<any> {
        return await this.googleChatService.sendAnnouncementWebHook(data, user);
    }

    async sendReminderMeetings(meetings: MeetingDocument[]): Promise<any> {
        meetings.forEach((item) => {
            this.telegramBotService.sendNotifyTelegram(item);
            const webHookMeeting = (item.team as Team).webHook;
            this.googleChatService.sendNotifyWebHook(item, webHookMeeting, true);
        });
    }

    async sendNotifyTasks(team: Team, tasks: Task[]) {
        if (tasks.length) {
            const data: Meeting[] = parseReviewTasks(tasks, team.users);

            data.forEach((task) => {
                //this.telegramBotService.sendNotifyTelegram(task, team.reviewChatId);
                this.googleChatService.sendNotifyWebHookReview(task, team.webHook);
            });
        }
    }

    async sendNotifyMissingTime(team: Team, tasks: Task[]) {
        if (tasks.length) {
            const data = parseMissingTimeTasks(tasks, team.users);

            if (data) {
                this.googleChatService.sendNotifyWebHookActiveTimeTreking(data, team.webHook);
            }
        }
    }
}
