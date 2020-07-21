export interface Task {
    id: string;
    key: string;
    devName: string;
    pointDev: number;
    testName: string;
    pointTest: number;
    sprintName: string;
    sprintsName: string;
}

export interface Analytics {
    sprints: SprintPoint[];
    sprintsAvg: {
        dev: PointAvg[];
        test: PointAvg[];
    }
}

export interface Assignee {
    name: string;
    count: number;
    point: number;
    type: number; //0 - dev, 1 - test
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