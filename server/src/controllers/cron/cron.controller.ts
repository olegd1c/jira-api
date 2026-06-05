import { Controller, Param, Post } from '@nestjs/common';
import ParamsWithId from '@app/utils/paramsWithId';
import { MeetingCronService } from '@services/cron/meeting.cron.service';
import { ReviewCronService } from '@services/cron/review.cron.service';
import { TimeTrackingCronService } from '@services/cron/timetracking.cron.service';

@Controller('crons')
export class CronController {
    constructor(
        private reviewCronService: ReviewCronService,
        private timeTrackingCronService: TimeTrackingCronService,
        private meetingCronService: MeetingCronService,
    ) {}

    @Post(':id/review')
    runReview(@Param() { id }: ParamsWithId) {
        this.reviewCronService.handleCronForTeam(id);
        return { success: true };
    }

    @Post(':id/timetracking')
    runTimeTracking(@Param() { id }: ParamsWithId) {
        this.timeTrackingCronService.handleCronForTeam(id);
        return { success: true };
    }

    @Post(':id/meeting')
    runMeeting(@Param() { id }: ParamsWithId) {
        this.meetingCronService.handleCronForTeam(id);
        return { success: true };
    }
}
