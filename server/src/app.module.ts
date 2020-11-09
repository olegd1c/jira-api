import { HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './services/app.service';
import { JiraService } from './services/jira.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramBotService } from './services/telegram-bot.service';

ConfigModule.forRoot({
  envFilePath: ['.env.local', '.env'], 
});

@Module({
  imports: [AuthModule, ConfigModule.forRoot(), HttpModule],
  controllers: [AppController],
  providers: [AppService, JiraService, ConfigService, TelegramBotService],
})
export class AppModule {}
