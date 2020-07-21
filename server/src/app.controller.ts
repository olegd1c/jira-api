import { Controller, Get, Param, Req, Query, Post, Body, UseGuards } from '@nestjs/common';
import { AppService } from './services/app.service';
import { JiraService } from './services/jira.service';
import { GetUser } from './auth/user/get-user.decorator';
import { User } from './models/user.model';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jiraService: JiraService,
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

  @Post('/auth2')
  signIn2(@Body() authCredo: any): string {
      return 'ok';
  }

}
