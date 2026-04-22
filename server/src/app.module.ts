import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';

import CasesModule from './controllers/case/case.module';
import TeamModule from "@app/controllers/team/team.module";
import MeetingModule from '@app/controllers/meeting/meeting.module';
import UserModule from './controllers/user/user.module';

import { TasksService } from '@services/tasks.service';
import { AppService } from '@services/app.service';
import { JiraService } from '@services/jira.service';
import { MeetingCronService } from '@services/cron/meeting.cron.service';
import { ReviewCronService } from '@services/cron/review.cron.service';
import { TimeTrackingCronService } from '@services/cron/timetracking.cron.service';
import { TelegramBotService } from '@services/telegram-bot.service';
import { GoogleChatService } from '@services/google-chat.service';
import { NotificationService } from '@services/notification.service';
import CasesService from './controllers/case/case.service';
import MeetingService from './controllers/meeting/meeting.service';
import UserService from './controllers/user/user.service';
import TeamService from './controllers/team/team.service';
import TasksModule from './controllers/task/task.module';

ConfigModule.forRoot({
  envFilePath: ['.env.local', '.env'],
})

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    HttpModule,
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const url = configService.get('MONGODB_URI');
        const database = configService.get('MONGO_DATABASE');
        return {
          uri: url,
          dbName: database,
        };
      },
      inject: [ConfigService],
    }),
    CasesModule,
    MeetingModule,
    UserModule,
    TeamModule,
    TasksModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JiraService,
    ConfigService,
    TelegramBotService,
    GoogleChatService,
    NotificationService,
    TasksService,
    CasesService,
    MeetingService,
    UserService,
    MeetingCronService,
    ReviewCronService,
    TimeTrackingCronService,
    TeamService
  ],
  exports: [
    MeetingService
  ]
})
export class AppModule {}
