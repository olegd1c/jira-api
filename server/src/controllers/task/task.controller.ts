import { JwtAuthGuard } from '@app/auth/jwt/jwt-auth.guard';
import { JiraService } from '@app/services/jira.service';
import { Permissions } from '@shared_models/permission.enum';

export const MetaPermissions = (...permissions: string[]) => SetMetadata('permissions', permissions);

import {
    Controller,
    Get,
    Param,
    Query,
    SetMetadata,
    UseGuards,
  } from '@nestjs/common';
   
  @Controller('tasks')
  export default class TaskController {
    constructor(
      private readonly jiraService: JiraService
      ) {}
   
    @MetaPermissions(Permissions.view)
    @UseGuards(JwtAuthGuard)
    @Get()
    getTasks(
      @Query() query
    ): Promise<any> {
  
      return this.jiraService.getAllTasks(query);
    }

    @MetaPermissions(Permissions.view)
    @UseGuards(JwtAuthGuard)
    @Get('for-build')
    getTaskForBuild(
      @Query() query
    ): Promise<any> {
      return this.jiraService.getTaskForBuild(query);
    }

    @MetaPermissions(Permissions.view)
    @UseGuards(JwtAuthGuard)
    @Get('/:key')
    getTask(
      @Param('key') key: string
    ): Promise<any> {
      return this.jiraService.getIssue(key);
    }

    @MetaPermissions(Permissions.view)
    @UseGuards(JwtAuthGuard)
    @Get('announcement/:key')
    getTaskAnnouncement(
      @Param('key') key: string
    ): Promise<any> {
      return this.jiraService.getIssueAnnouncement(key);
    }
  
  }