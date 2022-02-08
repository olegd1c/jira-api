import { User } from '@app/mongo/schemas/user.shema';
import { WeekType } from '@app/utils/utils';
import { IsNotEmpty } from 'class-validator';


export class PostDto {
    @IsNotEmpty()
    time: string;

    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    team: string;

    @IsNotEmpty()
    cronTime: string;

    @IsNotEmpty()
    weekType: WeekType;
}