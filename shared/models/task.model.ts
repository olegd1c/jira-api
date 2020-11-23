export interface Task {
    id: string;
    key: string;
    devName: string;
    pointDev: number;
    testName: string;
    pointTest: number;
    pointStory: number;
    sprintName: string;
    sprintsName: string;
    reviewers: [];
}

export interface Analytics {
    sprints: SprintPoint[];
    sprintsAvg: {
        dev: PointAvg[];
        test: PointAvg[];
        reviewer: PointAvg[];
    }
}

export enum TypeAssignee {
    dev = 0,
    test = 1,
    reviewer = 2
}

export interface Assignee {
    name: string;
    count: number;
    point: number;
    type: number; //0 - dev, 1 - test, 2 - reviewer
}

export interface PointAvg {
    name: string;
    countSprint: number;
    countAll: number;
    pointAll: number;
    countAvg: number|string;
    pointAvg: number|string;
}

export interface SprintPoint {
    name: string;
    values: Assignee[];
}

export interface TaskAnnouncement {
    devName: string;
    testName: string;
    summary: string;
    link: string;
    key: string;
}