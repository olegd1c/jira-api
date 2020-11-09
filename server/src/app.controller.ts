import { Controller, Get, Param, Req, Query, Post, Body, UseGuards } from '@nestjs/common';
import { JiraService } from './services/jira.service';
import { GetUser } from './auth/user/get-user.decorator';
import { User } from './models/user.model';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';
import { TelegramBotService } from './services/telegram-bot.service';
import { Observable } from 'rxjs';

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
  getBoards(
    @Query() query
  ): Promise<any> {
    return this.jiraService.getAllBoards(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sprints')
  getSprints(
    @Query() query,
    @GetUser() user: User,
  ): Promise<any> {
    return this.jiraService.getAllSprints(query, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tasks')
  getTasks(
    @Query() query
  ): Promise<any> {

    return this.jiraService.getAllTasks(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pointsByDev')
  getPointsByDev(
    @Query() query
  ): Promise<any> {

    return this.jiraService.getPointByDev(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('task/:key')
  getTask(
    @Param('key') key: string
  ): Promise<any> {
    return this.jiraService.getIssue(key);
  }

  @UseGuards(JwtAuthGuard)
  @Get('task-announcement/:key')
  getTaskAnnouncement(
    @Param('key') key: string
  ): Promise<any> {
    return this.jiraService.getIssueAnnouncement(key);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-announcement')
  sendAnnouncement(
    @Body() data: any
  ): Observable<any> {
    return this.telegramBotService.sendMessage(data);
  }

  @Post('/auth2')
  signIn2(@Body() authCredo: any): string {
      return 'ok';
  }

}
