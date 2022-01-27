import { HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './services/app.service';
import { JiraService } from './services/jira.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramBotService } from './services/telegram-bot.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from '@services/tasks.service';
import { MongooseConfigService } from '@app/mongo/service/mongoose.config.service';
import { MongooseModule } from '@nestjs/mongoose';
import CasesModule from './controllers/case/case.module';
import CasesService from './controllers/case/case.service';

ConfigModule.forRoot({
  envFilePath: ['.env.local', '.env'], 
});

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
    CasesModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JiraService,
    ConfigService,
    TelegramBotService,
    TasksService,
    CasesService
  ],
})
export class AppModule {}
