import {IsNotEmpty, IsOptional} from 'class-validator';

export class PostDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    team: string;

    @IsNotEmpty()
    jiraLogin: string;

    @IsOptional()
    telegramLogin: string;

    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    status: string;
}