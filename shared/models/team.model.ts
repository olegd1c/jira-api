import { IUser } from "@shared_models/users.model";

export enum StatusTeam {
    active = 'Активна',
    blocked = 'Заблокована'
}

export interface ITeam {
    name: string;
    reviewChatId?: number;
    teamChatId?: string;
    chat_url?: string;
    review_url?: string;
    boardId?: number;
    checkReview?: boolean;
    checkMeeting?: boolean;
    users?: IUser[];
    status?: StatusTeam;
}