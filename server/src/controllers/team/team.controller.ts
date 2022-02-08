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

import TeamService from './team.service';
import {PostDto} from './dto/post.dto';

@Controller('teams')
export default class TeamController {
    constructor(private readonly service: TeamService) {
    }

    @Get()
    async getAllPosts() {
        return this.service.findAll();
    }

    @Get(':id')
    async getPost(@Param() {id}: ParamsWithId) {
        return this.service.findOne(id);
    }

    @Post()
    async createPost(@Body() post: PostDto) {
        return this.service.create(post);
    }

    @Delete(':id')
    async deletePost(@Param() {id}: ParamsWithId) {
        return this.service.delete(id);
    }

    @Put(':id')
    async updatePost(@Param() {id}: ParamsWithId, @Body() post: PostDto) {
        return this.service.update(id, post);
    }

    @Post('delete-all')
    async deleteAll() {
        return this.service.deleteAll();
    }
}