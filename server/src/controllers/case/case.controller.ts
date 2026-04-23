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
import CasesService from './case.service';
    import { PostDto } from './dto/post.dto';

   
  @Controller('cases')
  export default class CaseController {
    constructor(private readonly caseService: CasesService) {}
   
    @Get()
    async getAllPosts() {
      return this.caseService.findAll();
    }
   
    @Get(':id')
    async getPost(@Param() { id }: ParamsWithId) {
      return this.caseService.findOne(id);
    }
   
    @Post()
    async createPost(@Body() post: PostDto) {
      return this.caseService.create(post);
    }
   
    @Delete(':id')
    async deletePost(@Param() { id }: ParamsWithId) {
      return this.caseService.delete(id);
    }
   
    @Put(':id')
    async updatePost(@Param() { id }: ParamsWithId, @Body() post: PostDto) {
      return this.caseService.update(id, post);
    }

    @Post('delete-all')
    async deleteAll() {
      return this.caseService.deleteAll();
    }
  }