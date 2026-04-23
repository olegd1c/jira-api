import ParamsWithId from '@app/utils/paramsWithId';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
  } from '@nestjs/common';
import MeetingsService from './meeting.service';
    import { PostDto } from './dto/post.dto';

   
  @Controller('meetings')
  export default class MeetingController {
    constructor(private readonly meetingsService: MeetingsService) {}
   
    @Get()
    async getAllPosts() {
      return this.meetingsService.findAll();
    }
   
    @Get(':id')
    async getPost(@Param() { id }: ParamsWithId) {
      return this.meetingsService.findOne(id);
    }
   
    @Post()
    async createPost(@Body() post: PostDto) {
      return this.meetingsService.create(post);
    }
   
    @Delete(':id')
    async deletePost(@Param() { id }: ParamsWithId) {
      return this.meetingsService.delete(id);
    }
   
    @Put(':id')
    async updatePost(@Param() { id }: ParamsWithId, @Body() post: PostDto) {
      return this.meetingsService.update(id, post);
    }

    @Post('delete-all')
    async deleteAll() {
      return this.meetingsService.deleteAll();
    }
  }