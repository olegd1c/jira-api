import { IsNotEmpty } from 'class-validator';

export class PostDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    team: string;

    @IsNotEmpty()
    jiraLogin: string;

    @IsNotEmpty()
    telegramLogin: string;
}