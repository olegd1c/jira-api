import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { StatusTeam } from "@shared_models/team.model";

export class PostDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsNumber()
    reviewChatId?: number;

    @IsOptional()
    teamChatId?: number;

    @IsOptional()
    @IsString()
    chat_url?: string;

    @IsOptional()
    @IsString()
    review_url?: string;

    @IsOptional()
    @IsNumber()
    boardId?: number;

    @IsOptional()
    @IsBoolean()
    checkReview?: boolean;

    @IsOptional()
    @IsBoolean()
    checkMeeting?: boolean;

    @IsNotEmpty()
    @IsString()
    status: StatusTeam;
}