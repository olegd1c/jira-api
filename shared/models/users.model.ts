import { ITeam } from "@shared_models/team.model";

export enum StatusUser {
    active = 'Активний',
    blocked = 'Заблокований'
}

export interface IUser {
    name: string;
    team?: ITeam;
    jiraLogin: string;
    email: string;
    telegramLogin?: string;
    status: StatusUser;
}