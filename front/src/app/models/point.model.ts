interface Dev {
    name: string;
    count: number;
    point: number;
  }
  
  interface DevAvg {
    name: string;
    countSprint: number;
    countAll: number;
    pointAll: number;
    countAvg: number;
    pointAvg: number;
  }
  
  interface SprintPoint {
    name: string;
    values: Dev[];
  }
  
  export interface Analytics {
    sprints: SprintPoint[],
    sprintsAvg: {dev: DevAvg[], test: DevAvg[], reviewer: DevAvg[]}
  }