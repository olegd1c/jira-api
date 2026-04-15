import {IsBoolean, IsNotEmpty, IsOptional} from 'class-validator';
import {Transform} from "class-transformer";

export class PostDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    team: string;

    @IsNotEmpty()
    jiraLogin: string;

    @IsOptional()
    telegramLogin: string;

    @IsOptional()
    email: string;

    @IsNotEmpty()
    status: string;

    @IsOptional()
    @Transform(({ value }) => {
        // Якщо значення null, undefined або порожня строка — повертаємо false
        if (value === null || value === undefined || value === '') {
            return false;
        }
        // В іншому випадку намагаємося перетворити на boolean (напр. рядок "true" -> true)
        return [true, 'true', 1, '1'].includes(value);
    })
    @IsBoolean()
    isConfirm: boolean = false;

    @IsOptional()
    @Transform(({ value }) => {
        // Якщо значення null, undefined або порожня строка — повертаємо false
        if (value === null || value === undefined || value === '') {
            return false;
        }
        // В іншому випадку намагаємося перетворити на boolean (напр. рядок "true" -> true)
        return [true, 'true', 1, '1'].includes(value);
    })
    @IsBoolean()
    isExecutor: boolean = false;
}