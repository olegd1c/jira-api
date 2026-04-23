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
import UserService from './user.service';
import {PostDto} from './dto/post.dto';


@Controller('users')
export default class UserController {
    constructor(private userService: UserService) {
    }

    @Get()
    async getAllPosts() {
        return this.userService.findAll();
    }

    @Get('confirms')
    async getConfirms() {
        return this.userService.findConfirms();
    }

    @Get('executors')
    async getExecutors() {
        return this.userService.findExecutors();
    }

    @Get(':id')
    async getPost(@Param() {id}: ParamsWithId) {
        return this.userService.findOne(id);
    }

    @Post()
    async createPost(@Body() post: PostDto) {
        return this.userService.create(post);
    }

    @Delete(':id')
    async deletePost(@Param() {id}: ParamsWithId) {
        return this.userService.delete(id);
    }

    @Put(':id')
    async updatePost(@Param() {id}: ParamsWithId, @Body() post: PostDto) {
        return this.userService.update(id, post);
    }

    @Post('delete-all')
    async deleteAll() {
        return this.userService.deleteAll();
    }
}