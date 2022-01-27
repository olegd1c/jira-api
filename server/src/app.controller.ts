import { Controller, Get, Param, Req, Query, Post, Body, UseGuards, SetMetadata } from '@nestjs/common';
import { JiraService } from './services/jira.service';
import { GetUser } from './auth/user/get-user.decorator';
import { User } from './models/user.model';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';
import { TelegramBotService } from './services/telegram-bot.service';
import { Observable } from 'rxjs';
import { Permissions } from './shared/models/permission.enum';

export const MetaPermissions = (...permissions: string[]) => SetMetadata('permissions', permissions);

@Controller()
export class AppController {
  constructor(
    private readonly jiraService: JiraService,
    private readonly telegramBotService: TelegramBotService
    ) {}

  @Get()
  getHello(): string[] {
    const actions = [
      'boards',
      'sprints',
      'tasks?rapidViewId=472&sprintId=1673',
      'task/:key',
    ];
    return actions;
  }

  @UseGuards(JwtAuthGuard)
  @Get('boards')
  @MetaPermissions(Permissions.view)
  getBoards(
    @Query() query
  ): Promise<any> {
    return this.jiraService.getAllBoards(query);
  }

  @MetaPermissions(Permissions.view)
  @UseGuards(JwtAuthGuard)
  @Get('sprints')
  getSprints(
    @Query() query,
    @GetUser() user: User,
  ): Promise<any> {
    return this.jiraService.getAllSprints(query, user);
  }

  @MetaPermissions(Permissions.view)
  @UseGuards(JwtAuthGuard)
  @Get('tasks')
  getTasks(
    @Query() query
  ): Promise<any> {

    return this.jiraService.getAllTasks(query);
  }

  @MetaPermissions(Permissions.view)
  @UseGuards(JwtAuthGuard)
  @Get('pointsByDev')
  getPointsByDev(
    @Query() query
  ): Promise<any> {

    return this.jiraService.getPointByDev(query);
  }

  @MetaPermissions(Permissions.view)
  @UseGuards(JwtAuthGuard)
  @Get('task/:key')
  getTask(
    @Param('key') key: string
  ): Promise<any> {
    return this.jiraService.getIssue(key);
  }

  @MetaPermissions(Permissions.view)
  @UseGuards(JwtAuthGuard)
  @Get('task-announcement/:key')
  getTaskAnnouncement(
    @Param('key') key: string
  ): Promise<any> {
    return this.jiraService.getIssueAnnouncement(key);
  }

  @MetaPermissions(Permissions.notify)
  @UseGuards(JwtAuthGuard)
  @Post('send-announcement')
  @SetMetadata('permissions', [Permissions.notify])
  sendAnnouncement(
    @Body() data: any,
    @GetUser() user: User,
  ): Promise<any> {
    return this.telegramBotService.sendMessage(data, user);
  }

  @MetaPermissions(Permissions.notify)
  @UseGuards(JwtAuthGuard)
  @Post('update-story-points')
  @SetMetadata('permissions', [Permissions.notify])
  updateStorypoints(
      @Body() data: {boardId: string, keys: string[]},
  ): Promise<any> {
    return this.jiraService.updateStoryPoints(data);
  }

  @MetaPermissions(Permissions.notify)
  @UseGuards(JwtAuthGuard)
  @Post('send-reminder')
  @SetMetadata('permissions', [Permissions.notify])
  sendReminder(

  ): Promise<any> {
    console.log('send-reminder');
    return this.telegramBotService.sendReminder();
  }
}
