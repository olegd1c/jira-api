export interface AnnouncementTask {
    key: string;
    devName: string;
    testName: string;
    confirm: string;
    link: string;
    summary: string;
    info?: string;
}

export interface AnnouncementData {
    date: string | Date;
    executor: string;
    tasks: AnnouncementTask[];
}

export interface AnnouncementPayload {
    message: string;
    data: AnnouncementData;
}
