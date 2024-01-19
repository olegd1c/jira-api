import { WeekType } from '@app/utils/utils';
import { IsNotEmpty } from 'class-validator';
import { StatusMeeting } from '@shared_models/meeting.model';


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

    @IsNotEmpty()
    status: StatusMeeting;
}