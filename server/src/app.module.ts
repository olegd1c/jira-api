import { HttpModule, Module } from '@nestjs/common';
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
import { MeetingCronService } from '@services/meeting.cron.service';
import { ReviewCronService } from '@services/review.cron.service';
import { TelegramBotService } from '@services/telegram-bot.service';
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
        const username = configService.get('MONGO_USERNAME');
        const password = configService.get('MONGO_PASSWORD');
        const database = configService.get('MONGO_DATABASE');
        const host = configService.get('MONGO_HOST');        
        //const uri = `mongodb://${username}:${password}@${host}`;
        return {
          uri: url,
          dbName: database,
        };
      },
      inject: [ConfigService],
    }),
    //MongooseModule.forRoot('mongodb://localhost/nest'),
    //MongooseModule.forRootAsync({
    //  useClass: MongooseConfigService,
    //})
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
    TasksService,
    CasesService,
    MeetingService,
    UserService,
    MeetingCronService,
    ReviewCronService,
    TeamService
  ],
  exports: [
    MeetingService
  ]
})
export class AppModule {}
