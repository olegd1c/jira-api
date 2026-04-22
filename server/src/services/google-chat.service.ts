import { User } from '@app/models/user.model';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Meeting } from '@app/controllers/meeting/meeting.schema';
import { HttpService } from "@nestjs/axios";
import { prepareMessageWebHook } from '../utils/notification.utils';

@Injectable()
export class GoogleChatService {

    private readonly logger = new Logger(GoogleChatService.name);

    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
    ) { }

    async sendAnnouncementWebHook(data: { message: string }, user: User): Promise<boolean> {
        const announcementWebhook = this.configService.get('ANNOUNCEMENT_WEB_HOOK');
        if (announcementWebhook) {
            const message = data.message + 'Автор повідомлення: ' + user.displayName + "\n\n";
            const payload = { text: message };
            if (!message) {
                return false;
            }
            try {
                const result = await this.httpService.post(announcementWebhook, payload).toPromise();
                return result && result.status == 200 ? true : false;
            } catch (err) {
                this.logger.error(`Failed to send announcement webhook: ${err.message}`);
                return false;
            }
        }
        return false;
    }

    sendNotifyWebHookReview(meeting: Meeting, webHook: string) {
        this.sendNotifyWebHook(meeting, webHook);
    }

    sendNotifyWebHookActiveTimeTreking(meeting: Meeting, webHook: string) {
        this.sendNotifyWebHook(meeting, webHook);
    }

    sendNotifyWebHook(meeting: Meeting, webhookUrl: string, sendAll = false) {
        const requestId = Math.random().toString(36).substring(7);
        //this.logger.debug(`[${requestId}] sendNotifyWebHook, sendAll: ${sendAll}`);

        if (!webhookUrl || !webhookUrl.trim()) {
            this.logger.warn(`[${requestId}] Webhook URL is missing or empty`);
            return;
        }

        const cleanUrl = webhookUrl.trim();
        const message = prepareMessageWebHook(meeting, sendAll);
        const payload = { text: message };

        if (!message) {
            this.logger.debug(`[${requestId}] Message is empty, skipping`);
            return;
        }

        //this.logger.debug(`[${requestId}] Sending webhook to ${cleanUrl}`);

        this.httpService.post(cleanUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        }).subscribe({
            next: (response) => {
                this.logger.log(`[${requestId}] Webhook sent successfully: ${response.status}`);
            },
            error: (error) => {
                this.logger.error(`[${requestId}] Failed to send webhook`);
                if (error.response) {
                    this.logger.error(`[${requestId}] Status: ${error.response.status}`);
                    try {
                        this.logger.error(`[${requestId}] Data: ${JSON.stringify(error.response.data)}`);
                    } catch (e) {
                        this.logger.error(`[${requestId}] Data (raw): ${error.response.data}`);
                    }
                } else if (error.request) {
                    this.logger.error(`[${requestId}] No response received from webhook server`);
                } else {
                    this.logger.error(`[${requestId}] Request setup error: ${error.message}`);
                }
            }
        });
    }
}
