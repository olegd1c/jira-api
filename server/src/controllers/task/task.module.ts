import { JiraService } from '@app/services/jira.service';
import { TelegramBotService } from '@app/services/telegram-bot.service';
import { HttpModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TaskController from './task.controller';
 
@Module({
  imports: [
    HttpModule
  ],
  controllers: [TaskController],
  providers: [
    JiraService,
    TelegramBotService,
    ConfigService
  ],
  exports: [],
})
class TasksModule {}
 
export default TasksModule;