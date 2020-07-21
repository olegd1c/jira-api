import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';

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

interface Analytics {
  sprints: SprintPoint[],
  sprintsAvg: {dev: DevAvg[], test: DevAvg[]}
}

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.scss']
})
export class PointsComponent implements OnInit {
  
  title = 'points';
  points: Analytics;
  loading = false;
  showDetails = false;

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    
  }

  private getPoints(params) {
    this.loading = true;
    this.taskService.getPoints(params).then(result => {
      //console.log(result);
      this.points = result;
      this.loading = false;
    });
  }

  onSearch($event) {
    let params = {boardId: $event.boardId, sprints: $event.sprints};
    this.getPoints(params);
  }
}
