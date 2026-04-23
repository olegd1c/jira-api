export interface Sprint {
    id: string;
    name: string;
    state: string;
    startDate: number;
    endDate: string;
    completeDate: number;
}

export enum StateSprint {
    future = "future",
    active = "active",
    closed = "closed"
}