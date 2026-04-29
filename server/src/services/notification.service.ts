import { Injectable, Logger } from '@nestjs/common';
import { Task } from '@shared_models/task.model';
import { Team } from '@app/controllers/team/team.schema';
import { MeetingDocument } from '@app/controllers/meeting/meeting.schema';
import { User } from '@app/models/user.model';
import { AnnouncementPayload } from '@shared_models/announcement.model';
import { TelegramBotService } from './telegram-bot.service';
import { GoogleChatService } from './google-chat.service';
import { parseReviewTasks, prepareCardV2MissingTime, prepareCardV2ReviewTasks } from '../utils/notification.utils';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        private telegramBotService: TelegramBotService,
        private googleChatService: GoogleChatService,
    ) { }

    async sendAnnouncementMessage(data: AnnouncementPayload, user: User): Promise<any> {
        return await this.googleChatService.sendAnnouncementWebHook(data, user);
    }

    async sendReminderMeetings(meetings: MeetingDocument[]): Promise<any> {
        meetings.forEach((item) => {
            this.telegramBotService.sendNotifyTelegram(item);
            const team = item.team as Team;
            const chatUrl = team.chat_url;
            this.googleChatService.sendNotifyWebHook(item, chatUrl, true);
        });
    }

    async sendNotifyTasks(team: Team, tasks: Task[]) {
        if (tasks.length) {
            const cardPayload = prepareCardV2ReviewTasks(tasks, team.users);
            const webhookUrl = team.review_url || team.chat_url;
            this.googleChatService.sendNotifyWebHookReview(cardPayload, webhookUrl);
        }
    }

    async sendNotifyMissingTime(team: Team, tasks: Task[]) {
        if (tasks.length) {
            const cardPayload = prepareCardV2MissingTime(tasks, team.users);
            this.googleChatService.sendNotifyWebHookActiveTimeTreking(cardPayload, team.chat_url);
        }
    }
}
